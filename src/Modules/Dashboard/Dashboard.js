import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';

const Dashboard = () => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [records, setRecords] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [message, setMessage] = useState('');
    const formattedFromDate = moment(fromDate).format('YYYY-MM-DD');
    const formattedToDate = moment(toDate).format('YYYY-MM-DD');
    const [editId, setEditId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupRecord, setPopupRecord] = useState(null);

    // State to track additional rows in the popup modal
    const [additionalRows, setAdditionalRows] = useState([
        { date: '', amount: '' }
    ]);

    useEffect(() => {
        console.log(process.env.REACT_APP_API_URL);
        fetch(`${process.env.REACT_APP_API_URL}/dashboard/alldata`)
            .then((response) => response.json())
            .then((data) => {
                const formattedRecords = data.map(record => ({
                    ...record,
                    formattedFromDate: moment(record.fromDate).format('YYYY-MM-DD'),
                    formattedToDate: moment(record.toDate).format('YYYY-MM-DD'),
                }));
                setRecords(formattedRecords);
            })
            .catch((error) => {
                console.log('Error fetching data:', error);
                setMessage('Failed to load records');
                clearMessageAfterDelay();
            });
    }, []);

    const handleFormDateChange = (e) => {
        const date = e.target.value;
        setFromDate(date);
        const newToDate = new Date(date);
        newToDate.setDate(newToDate.getDate() + 100);
        setToDate(newToDate.toISOString().split('T')[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Format the dates using moment
        const formattedFromDate = moment(fromDate).format('YYYY-MM-DD');
        const formattedToDate = moment(toDate).format('YYYY-MM-DD');

        // Parse and validate the amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            setMessage('Amount must be a valid number');
            clearMessageAfterDelay();
            return;
        }

        // Prepare the form data
        const formData = { name, amount: parsedAmount, formattedFromDate, formattedToDate };

        // If editing an existing record
        if (editId) {
            formData.id = editId;  // Attach the id of the record to the formData

            // Send PUT request to update the record
            fetch(`${process.env.REACT_APP_API_URL}/dashboard/Fn-dashboard/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update record');
                    }
                    return response.json();
                })
                .then((updatedData) => {
                    // Update the specific record in the state
                    const updatedRecords = records.map(record =>
                        record._id === updatedData._id ? updatedData : record
                    );
                    setRecords(updatedRecords);
                    setMessage('Record updated successfully');
                    clearMessageAfterDelay();
                    resetForm();
                    setEditId(null);  // Clear the edit mode
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setMessage(error.message || 'Failed to submit the form');
                    clearMessageAfterDelay();
                });
        } else {
            // If adding a new record
            fetch(`${process.env.REACT_APP_API_URL}/dashboard/Fn-dashboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add record');
                    }
                    return response.json();
                })
                .then((data) => {
                    // Add the new record to the state
                    setRecords([...records, data]);
                    setMessage('Record added successfully');
                    clearMessageAfterDelay();
                    resetForm();
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setMessage(error.message || 'Failed to submit the form');
                    clearMessageAfterDelay();
                });
        }
    };

    const resetForm = () => {
        setName('');
        setAmount('');
        setFromDate('');
        setToDate('');
    };

    const handleEdit = (id) => {
        const record = records.find(record => record._id === id);
        setName(record.name);
        setAmount(record.amount);
        setFromDate(record.formattedFromDate);
        setToDate(record.formattedToDate);
        setEditId(record._id);
    };

    const handleDelete = (index) => {
        const updatedRecords = records.filter((_, i) => i !== index);
        setRecords(updatedRecords);
        setMessage("Record deleted successfully");
        clearMessageAfterDelay();
    };

    const clearMessageAfterDelay = () => {
        setTimeout(() => {
            setMessage('');
        }, 3000);
    };

    const handleNameClick = (record) => {
        setPopupRecord(record);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const handleAddRow = () => {
        setAdditionalRows([
            ...additionalRows,
            { date: '', amount: '' } // Add a new empty row
        ]);
    };

    const handleRemoveRow = (index) => {
        setAdditionalRows(additionalRows.filter((_, i) => i !== index));
    };

    const handleInputChange = (e, index, field) => {
        const newRows = [...additionalRows];
        newRows[index][field] = e.target.value;
        setAdditionalRows(newRows);
    };

    const handleSaveChanges = () => {
        // Combine the original record with the new rows
        const updatedRecord = {
            ...popupRecord,
            additionalRows: additionalRows // Add the new rows to the record
        };
        console.log("Updated Record:", updatedRecord);
        setShowPopup(false); // Close the modal
    };

    return (
        <div className="container mt-4">
            <h2>Dashboard</h2>

            {message && <div className="alert alert-success">{message}</div>} {/* Display success message */}

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group mb-3">
                    <input
                        type="date"
                        className="form-control"
                        value={fromDate}
                        onChange={handleFormDateChange}
                        required
                    />
                </div>
                <div className="form-group mb-3">
                    <input
                        type="date"
                        className="form-control"
                        value={toDate}
                        readOnly
                    />
                </div>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Save'}</button>
            </form>

            <h2 className="mt-4">Records</h2>

            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Serial Number</th>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <a href="#!" onClick={() => handleNameClick(record)}>{record.name}</a>
                                </td>
                                <td>{record.amount}</td>
                                <td>{record.formattedFromDate}</td> {/* Display the date next to the name */}
                                <td>{record.formattedFromDate}</td>
                                <td>{record.formattedToDate}</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(record._id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(index)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Popup Modal */}
            {showPopup && popupRecord && (
                <div className="modal show" style={{ display: 'block' }} onClick={closePopup}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Name: {popupRecord.name}</h5><br />
                                <h5 className="modal-title">Amount: {popupRecord.amount}</h5><br />
                                <h5 className="modal-title">Date: {popupRecord.formattedFromDate}</h5>
                                <button type="button" className="close" onClick={closePopup}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            {/* Modal Body */}
                            <div className="modal-body">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Serial Number</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Displaying the original row for initial Date and Amount */}
                                        {/* <tr>
                                            <td>1</td>
                                            <td>{popupRecord.formattedFromDate}</td>
                                            <td>{popupRecord.amount}</td>
                                            <td>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveRow(0)}>
                                                    Remove
                                                </button>
                                            </td>
                                        </tr> */}

                                        {/* Additional rows added dynamically */}
                                        {additionalRows.map((row, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td> {/* Start from 2 since the first row is static */}
                                                <td>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={row.date}
                                                        onChange={(e) => handleInputChange(e, index, 'date')}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={row.amount}
                                                        onChange={(e) => handleInputChange(e, index, 'amount')}
                                                    />
                                                </td>
                                                <td>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveRow(index)}>
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <button className="btn btn-success" onClick={handleAddRow}>
                                    Add Row
                                </button>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveChanges}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

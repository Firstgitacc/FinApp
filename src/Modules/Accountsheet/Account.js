import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';

const Account = ({ record, onSubmit }) => {
    const [date, setDate] = useState('');
    const [dcc, setDcc] = useState('');
    const [vcj, setVcj] = useState('');
    const [dvs, setDvs] = useState('');
    const [sc, setSc] = useState('');
    const [records, setRecords] = useState([]);
    const [message, setMessage] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [touchedFields, setTouchedFields] = useState({
        date: false,
        dcc: false,
        vcj: false,
        dvs: false,
        sc: false,
    });
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`; // Return date in YYYY-MM-DD format
    };

    const convertToInputDateFormat = (dateString) => {
        const [day, month, year] = dateString.split('-'); // Split the DD-MM-YYYY string
        return `${year}-${month}-${day}`; // Return in the YYYY-MM-DD format
    };

    useEffect(() => {
        console.log(process.env.REACT_APP_API_URL);
        fetch(`${process.env.REACT_APP_API_URL}/account`)
            .then((response) => response.json())
            .then((data) => {
                const formattedRecords = data.map(record => ({
                    ...record,
                    formattedDate: formatDate(record.date), // Add the formatted date
                }));
                setRecords(formattedRecords);  // Set the formatted records
            })
            .catch((error) => {
                console.log('Error fetching data:', error);
                setMessage('Failed to load records');
                clearMessageAfterDelay();
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure the date is correctly formatted before submission
        const formattedDate = moment(date).format('YYYY-MM-DD'); // Ensure the date is in 'YYYY-MM-DD' format
        const apiUrl = `${process.env.REACT_APP_API_URL}/account`;

        const newRecord = { date: formattedDate, dcc, vcj, dvs, sc };

        if (editIndex !== null) {
            const recordId = records[editIndex]?._id;
            if (!recordId) {
                console.error('Record ID is missing');
                setMessage('Failed to update: Record ID is missing');
                return;  // Prevent sending a request without an ID
            }
            fetch(`${apiUrl}/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord),
            })
                .then((response) => response.json())
                .then((data) => {
                    // Update the records array with the updated record
                    const updatedRecords = [...records];
                    updatedRecords[editIndex] = { ...newRecord, _id: recordId, formattedDate }; // Update with new formatted date
                    setRecords(updatedRecords); // Set the updated records
                    setMessage('Record updated successfully!');
                    setEditIndex(null); // Reset edit mode
                })
                .catch((error) => {
                    console.log('Error:', error);
                    setMessage('Failed to update the record');
                });

        } else {
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord),
            })
                .then((response) => response.json())
                .then((data) => {
                    // Add the new record with the formatted date
                    const newRecordWithDate = { ...newRecord, _id: data._id, formattedDate }; // Assuming response contains the ID
                    setRecords([...records, newRecordWithDate]); // Update the records state
                    setMessage('Record added successfully!');
                })
                .catch((error) => {
                    console.log('Error:', error);
                    setMessage('Failed to submit the form');
                });
        }

        clearForm();
        clearMessageAfterDelay();
    };

    const clearForm = () => {
        setDate('');
        setDcc('');
        setVcj('');
        setDvs('');
        setSc('');
    };

    const clearMessageAfterDelay = () => {
        setTimeout(() => {
            setMessage('');
        }, 3000);
    };

    const handleDccChange = (e) => {
        const Dailykathakarchulu = e.target.value;
        setDcc(Dailykathakarchulu);
        const newvcj = (Dailykathakarchulu * 0.16667).toFixed(0);
        setVcj(newvcj);
    };

    const handleEdit = (index) => {
        const record = records[index];
        if (!record._id) {
            console.error('Record ID is missing');
            setMessage('Record ID is missing');
            return;
        }
        const formattedDate = moment(record.date).format('YYYY-MM-DD');
        setDate(formattedDate);
        setDcc(record.dcc);
        setVcj(record.vcj);
        setDvs(record.dvs);
        setSc(record.sc);
        setEditIndex(index);
        setTouchedFields({
            date: false,
            dcc: false,
            vcj: false,
            dvs: false,
            sc: false,
        });
    };

    const handleDelete = (index) => {
        const updatedRecords = records.filter((_, i) => i !== index);
        setRecords(updatedRecords);
        setMessage('Record deleted successfully');
        clearMessageAfterDelay();
    };
    const handleInputChange = (e, field) => {
        const { value } = e.target;
        // Update the state for the specific field
        if (field === 'date') setDate(value);
        else if (field === 'dcc') setDcc(value);
        else if (field === 'vcj') setVcj(value);
        else if (field === 'dvs') setDvs(value);
        else if (field === 'sc') setSc(value);

        // Mark this field as touched
        setTouchedFields((prev) => ({ ...prev, [field]: true }));
    };
    //const highlightClass = (field) => (editIndex !== null && field ? 'highlight' : '');
    const highlightClass = (field) => (editIndex !== null && !touchedFields[field] ? 'highlight' : '');
    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Account Sheet</h2>

            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className={`form-control ${highlightClass('date')}`} // Add highlight class
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">DCC</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Daily katha karchu"
                            value={dcc}
                            onChange={handleDccChange}
                            required
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">VCJ</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Vaddila katha Jama"
                            value={vcj}
                            onChange={(e) => setVcj(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">DVS</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Daily vasulu"
                            value={dvs}
                            onChange={(e) => setDvs(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">SC</label>
                    <input
                        type="text"
                        className={`form-control ${highlightClass('sc')}`}
                        placeholder="Sadar katha karchu"
                        value={sc}
                        onChange={(e) => handleInputChange(e, 'sc')}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-success w-100">Save</button>
            </form>

            <div className="mt-5">
                <h3>Records</h3>
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Serial Number</th>
                            <th>Date</th>
                            <th>DCC</th>
                            <th>VCJ</th>
                            <th>DVS</th>
                            <th>SC</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{record.formattedDate}</td>
                                <td>{record.dcc}</td>
                                <td>{record.vcj}</td>
                                <td>{record.dvs}</td>
                                <td>{record.sc}</td>
                                <td>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(index)}>Edit</button>
                                    <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDelete(index)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Account;

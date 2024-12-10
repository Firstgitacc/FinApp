import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const Account = () => {
    const [date, setDate] = useState('');
    const [dcc, setDcc] = useState('');
    const [vcj, setVcj] = useState('');
    const [dvs, setDvs] = useState('');
    const [sc, setSc] = useState('');
    const [records, setRecords] = useState([]);
    const [message, setMessage] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const formatDate = (dateString) => {
        const date = new Date(dateString); // Convert to Date object
        const day = date.getDate().toString().padStart(2, '0'); // Day part
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month part (months are 0-indexed, so add 1)
        const year = date.getFullYear(); // Year part

        return `${day}-${month}-${year}`; // Return formatted date
    };
    useEffect(() => {
        console.log(process.env.REACT_APP_API_URL);
        fetch(`${process.env.REACT_APP_API_URL}/account`)
            .then((response) => response.json())
            .then((data) => {
                //  setRecords(data);  // Set the records received from the API
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
        const formattedDate = formatDate(date);
        const apiUrl = `${process.env.REACT_APP_API_URL}/account`
        console.log('API URL:', process.env.REACT_APP_API_URL);
        const newRecord = { formattedDate, dcc, vcj, dvs, sc };
        if (editIndex !== null) {
            const recordId = records[editIndex].id;
            fetch(`${apiUrl}/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord),
            })
                .then((response) => response.json())
                .then((data) => {
                    const updatedRecords = [...records];
                    updatedRecords[editIndex] = { ...newRecord, id: recordId }; // Keep the original record's ID
                    setRecords(updatedRecords);
                    setMessage('Record updated successfully!');
                    setEditIndex(null); // Reset edit mode
                })
                .catch((error) => {
                    console.log('Error:', error);
                    setMessage('Failed to update the record');
                });

        } else {
            // Create a new record
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (editIndex !== null) {
                        const updatedRecords = [...records]
                        updatedRecords[editIndex] = newRecord;
                        setRecords(updatedRecords);
                        setMessage('Record updated successfully!');
                        setEditIndex(null); // Reset edit mode
                    } 
                    else {
                        // If not editing, add a new record
                        setRecords([...records, newRecord]);
                        setMessage('Record added successfully!');
                    }
                })
                .catch((error) => {
                    console.log('Error:', error);
                    setMessage('Failed to submit the form');
                });
        }


        // setRecords([...records, newRecord]);
        // setMessage('Record added successfully!');
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

        // Multiply the entered value by 0.16667 and add to VCJ
        const newvcj = (Dailykathakarchulu * 0.16667).toFixed(0);
        setVcj(newvcj);
    };

    const handleVcjChange = (e) => {
        const vaddilakathakarchulu = e.target.value;
        setVcj(vaddilakathakarchulu);
    };

    const handleEdit = (index) => {
        const record = records[index];
        setDate(record.date);
        setDcc(record.dcc);
        setVcj(record.vcj);
        setDvs(record.dvs);
        setSc(record.sc);
        setEditIndex(index);
    };

    const handleDelete = (index) => {
        const updatedRecords = records.filter((_, i) => i !== index);
        setRecords(updatedRecords);
        setMessage('Record deleted successfully');
        clearMessageAfterDelay();
    };

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
                            className="form-control"
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
                            onChange={handleVcjChange}
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
                        className="form-control"
                        placeholder="Sadar katha karchu"
                        value={sc}
                        onChange={(e) => setSc(e.target.value)}
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

import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure Bootstrap CSS is imported

const Dashboard = () => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [records, setRecords] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/dashboard/alldata')
            .then((response) => response.json())
            .then((data) => {
                setRecords(data);  // Set the records received from the API
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setMessage('Failed to load records');
                clearMessageAfterDelay();
            });
    }, []);

    const handleFormDateChange = (e) => {
        const date = e.target.value;
        setFromDate(date);
        const newToDate = new Date(date);
        newToDate.setDate(newToDate.getDate() + 100);
        setToDate(newToDate.toISOString().split('T')[0])
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = { name, amount, fromDate, toDate };
        
        const apiUrl = "http://localhost:5000/dashboard/Fn-dashboard";
        
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to submit the data');
            return response.json();
        })
        .then(data => {
            if (editIndex !== null) {
                const updatedRecords = records.map((record, index) =>
                    index === editIndex ? { name, amount, fromDate, toDate } : record
                );
                setRecords(updatedRecords);
                setEditIndex(null);
                setMessage("Record updated successfully");
            } else {
                setRecords([...records, { name, amount, fromDate, toDate }]);
                setMessage("Record added successfully");
            }
            clearMessageAfterDelay();
            resetForm();
        })
        .catch(error => {
            console.error('Error:', error);
            setMessage('Failed to submit the form');
            clearMessageAfterDelay();
        });
    };

    const resetForm = () => {
        setName('');
        setAmount('');
        setFromDate('');
        setToDate('');
    };

    const handleEdit = (index) => {
        const record = records[index];
        setName(record.name);
        setAmount(record.amount);
        setFromDate(record.fromDate);
        setToDate(record.toDate);
        setEditIndex(index);
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
                <button type="submit" className="btn btn-primary">Save</button>
            </form>

            <h2 className="mt-4">Records</h2>
            
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Serial Number</th>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{record.name}</td>
                                <td>{record.amount}</td>
                                <td>{record.fromDate}</td>
                                <td>{record.toDate}</td>
                                <td>
                                    <button 
                                        className="btn btn-warning btn-sm" 
                                        onClick={() => handleEdit(index)}
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
        </div>
    );
}

export default Dashboard;

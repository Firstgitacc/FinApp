import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';
import * as XLSX from 'xlsx';

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
    const [numberInput, setNumberInput] = useState('');
    const [totalSum, setTotalSum] = useState(0);
    const [finalAmount, setFinalAmount] = useState('');
    const [baseAmount, setBaseAmount] = useState(10000);

    useEffect(() => {
        console.log(process.env.REACT_APP_API_URL);
        const savedBaseAmount = localStorage.getItem('baseAmount');
    const initialBaseAmount = savedBaseAmount && !isNaN(parseFloat(savedBaseAmount)) 
        ? parseFloat(savedBaseAmount) 
        : 808362; // Fallback to default if invalid or not available

    setBaseAmount(initialBaseAmount); // Set the base amount from localStorage or default
    console.log("Base Amount on Load:", initialBaseAmount);
        fetch(`${process.env.REACT_APP_API_URL}/account`)
            .then((response) => response.json())
            .then((data) => {
                const formattedRecords = data.map(record => ({
                    ...record,
                    formattedDate: formatDate(record.date), // Add the formatted date
                }));
                setRecords(formattedRecords);  // Set the formatted records
                // // Make sure to get the latest baseAmount (finalAmount from last record)
                // const latestBaseAmount = formattedRecords.length > 0
                //     ? formattedRecords[formattedRecords.length - 1].finalAmount
                //     : baseAmount; // Default base amount if no records exist

                // setBaseAmount(latestBaseAmount); // Set the latest base amount
                calculateFinalAmount(formattedRecords); // Recalculate final amount based on the records
                console.log("useeffect", calculateFinalAmount(formattedRecords));
                
            })
            .catch((error) => {
                console.log('Error fetching data:', error);
                setMessage('Failed to load records');
                clearMessageAfterDelay();
            });
    }, []);
    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedDate = moment(date).format('YYYY-MM-DD'); // Ensure the date is in 'YYYY-MM-DD' format
        const apiUrl = `${process.env.REACT_APP_API_URL}/account`;

        const newRecord = { date: formattedDate, dcc, vcj, dvs, sc, finalAmount };

        if (editIndex !== null) {
            const recordId = records[editIndex]?._id;
            if (!recordId) {
                console.error('Record ID is missing');
                setMessage('Failed to update: Record ID is missing');
                return;
            }
            fetch(`${apiUrl}/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord),
            })
                .then((response) => response.json())
                .then((data) => {
                    const updatedRecords = [...records];
                    updatedRecords[editIndex] = { ...newRecord, _id: recordId, formattedDate };
                    setRecords(updatedRecords);
                    setMessage('Record updated successfully!');
                    setEditIndex(null); // Reset edit mode
                    calculateFinalAmount(updatedRecords); // Recalculate final amount after update
                    console.log("hsubmitupdate", calculateFinalAmount(updatedRecords))
                })
                .catch((error) => {
                    console.log('Error:', error);
                    setMessage('Failed to update the record');
                });
        } else {
            // Reset baseAmount when adding a new record
            //setBaseAmount(808362);

            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord),
            })
                .then((response) => response.json())
                .then((data) => {
                    const newRecordWithDate = { ...newRecord, _id: data._id, formattedDate };
                    setRecords([...records, newRecordWithDate]);
                    setMessage('Record added successfully!');
                    calculateFinalAmount([...records, newRecordWithDate]); // Recalculate final amount after adding new record
                    console.log("hsubmitnew", calculateFinalAmount([...records, newRecordWithDate]))
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
    const highlightClass = (field) => (editIndex !== null && !touchedFields[field] ? 'highlight' : '');
    // Function to export data to Excel
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(records.map(record => ({
            'Serial Number': records.indexOf(record) + 1,
            'Date': record.formattedDate,
            'DCC': record.dcc,
            'VCJ': record.vcj,
            'DVS': record.dvs,
            'SC': record.sc,
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');

        // Export the Excel file
        XLSX.writeFile(workbook, 'Records.xlsx');
    };
    const handleNumberInputChange = (e) => {
        const value = e.target.value;
        setNumberInput(value);

        // Parse the numbers from the input (comma or space separated)
        const numbers = value.split(/[, ]+/).map(num => parseFloat(num)).filter(num => !isNaN(num));

        // Calculate the sum
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        setTotalSum(sum);
    };
    // Function to calculate the final amount based on the latest record
    // const calculateFinalAmount = (records) => {
    //  let currentBaseAmount = parseFloat(localStorage.getItem('baseAmount')) || 808362
    //     if (records.length > 0) {
    //         const latestRecord = records.reduce((latest, record) => {
    //             return moment(record.date).isAfter(moment(latest.date)) ? record : latest;
    //         });

    //         // Calculate final amount using vcj, dcc, and sc           
    //         console.log("parseFloat(latestRecord.vcj)", parseFloat(latestRecord.vcj));
    //         console.log("parseFloat(latestRecord.dvs)", parseFloat(latestRecord.dvs));
    //         console.log("parseFloat(latestRecord.dcc)", parseFloat(latestRecord.dcc));
    //         console.log("parseFloat(latestRecord.sc)", parseFloat(latestRecord.sc));

    //         const calculatedFinalAmount = currentBaseAmount +
    //             (parseFloat(latestRecord.vcj) + parseFloat(latestRecord.dvs)) -
    //             (parseFloat(latestRecord.dcc) + parseFloat(latestRecord.sc));

    //         console.log("Base Amount", currentBaseAmount);
    //         console.log("calculatedFinalAmount ,final amount", calculatedFinalAmount);
    //         setFinalAmount(calculatedFinalAmount); // Update final amount
    //         localStorage.setItem('baseAmount', calculatedFinalAmount);
    //         setBaseAmount(calculatedFinalAmount); // Update the base amount to be the new final amount
    //     }
    // };
    const calculateFinalAmount = (records, baseAmount) => {
    let finalAmount = baseAmount;
    records.forEach((record) => {
        const vcjValue = parseFloat(record.vcj) || 0;
        const dvsValue = parseFloat(record.dvs) || 0;
        const dccValue = parseFloat(record.dcc) || 0;
        const scValue = parseFloat(record.sc) || 0;
        finalAmount += (vcjValue + dvsValue) - (dccValue + scValue);
    });

    console.log("Calculated Final Amount:", finalAmount);

    // Store the new base amount in localStorage to persist for next refresh
    localStorage.setItem('baseAmount', finalAmount);
    setFinalAmount(finalAmount);
};
    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Account Sheet</h2>

            {message && <div className="alert alert-success">{message}</div>}
            {/* New field for number input */}
            <div className="mb-3">
                <label className="form-label">Enter Numbers (comma or space separated)</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter numbers here"
                    value={numberInput}
                    onChange={handleNumberInputChange}
                />
                {/* Display total sum below the input */}
                <div className="mt-2">
                    <strong>Total Sum: {totalSum}</strong>
                </div>
            </div>
            {/* Base Amount Input */}
            <div className="mb-3">
                <label className="form-label">Base Amount</label>
                <input
                    type="number"
                    className="form-control"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(parseFloat(e.target.value))}
                />
            </div>
            {/* Final Amount Field */}
            <div className="mb-3">
                <label className="form-label">Final Amount</label>
                <input
                    type="text"
                    className="form-control"
                    value={finalAmount}
                    disabled
                />
            </div>
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
                <button onClick={exportToExcel} className="btn btn-primary mb-3">
                    Export to Excel
                </button>
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

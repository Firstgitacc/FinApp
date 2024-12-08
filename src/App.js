// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './Modules/Dashboard/Dashboard';
import Account from './Modules/Accountsheet/Account'; // Adjust if this is the correct export
import Header from './Modules/Header/Header';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router> {/* Only one Router instance here */}
      <div className="App">
        <Header />
        <Routes>
          <Route path="/FinApp" element={<Dashboard />} />
          <Route path="/accountsheet" element={<Account />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

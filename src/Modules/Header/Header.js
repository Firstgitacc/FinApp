import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import './Header.css';

const Header = () => {
    const location = useLocation(); 

    const getTitle = () => {
        switch (location.pathname) {
            case '/accountsheet':
                return 'Welcome to Account Sheet';
            case '/FinApp':
                return 'Welcome to My FinApp';
            default:
                return 'Welcome to My FinApp'; 
        }
    };

    return (
        <header>
            <Link to="/FinApp" aria-label="Go to Dashboard">
                <i className="fas fa-home home-icon"></i>
            </Link>
            <h1>{getTitle()}</h1>
            <Link to="/accountsheet" aria-label="Go to Account Sheet">
                <i className="fas fa-file-alt account-icon"></i>
            </Link>
        </header>
    );
}

export default Header;

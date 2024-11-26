import React from 'react';
import DeliveryIcon from '../deliverTable/DeliveryIcon';
import './header.css';

const Header = ({ title }) => {
    return (
        <div className="header">
            <h1 className="header-title">{title}</h1>
            <div className="header-icon">
                <DeliveryIcon />
            </div>
        </div>
    );
};

export default Header;

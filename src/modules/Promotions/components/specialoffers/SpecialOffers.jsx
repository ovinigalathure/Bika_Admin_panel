import React from 'react';
import image2 from '../../assets/plate3.jpeg';
import './SpecialOffers.css';
const SpecialOffers = () => {
    return (
        <div className="promotion-section">
            <h2>Special Offers</h2>
            
            <div className="promotion-content">
            <img src={image2}  alt="Promotion" className="promotion-image" />
            <div className="controls">
                <button className="control-button">Customize</button>
                <button className="control-button">Price</button>
                <p>Rs.1200</p>
                <button className="control-button">Edit</button>
                <button className="control-button">Update</button>
                <button className="control-button">Discount</button>
                </div>
            </div>
        </div>
    );
};

export default SpecialOffers;

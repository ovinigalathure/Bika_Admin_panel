import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase'; 
import './NotificationFilters.css';
import { Link } from 'react-router-dom';

const NotificationFilters = () => {
  const [subscribers, setSubscribers] = useState([]); 
  const [showSubscribers, setShowSubscribers] = useState(false); 

  const handleShowSubscribers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'subscribers'));
      const emails = querySnapshot.docs.map((doc) => doc.data().email);
      setSubscribers(emails);
      setShowSubscribers(true);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  return (
    <div className="notification-filters">

      <Link to="/all">
      <button className="filter-button">
        <span role="img" aria-label="all">🔔</span> Comments
      </button>
      </Link>

      <Link to="/subscribe">
      <button className="filter-button" onClick={handleShowSubscribers}>
        <span role="img" aria-label="subscribers">🔔</span> Subscribers
      </button>
      </Link>
      {showSubscribers && (
        <div className="subscribers-list">
          <h3>Subscribers List</h3>
          <ul>
            {subscribers.map((email, index) => (
              <li key={index}>{email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;

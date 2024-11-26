import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust the path if necessary
import ReplyPopup from './ReplyPopup';
import '@fortawesome/fontawesome-free/css/all.min.css';

const HelpTable = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]); // State to track selected rows

  useEffect(() => {
    const fetchContacts = async () => {
      const querySnapshot = await getDocs(collection(db, 'contacts'));
      const contactsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort contacts by the latest timestamp
      const sortedContacts = contactsData.sort((a, b) => {
        const timestampA = a.timestamp?.toDate().getTime() || 0; // Convert to milliseconds
        const timestampB = b.timestamp?.toDate().getTime() || 0; // Convert to milliseconds
        return timestampB - timestampA; // Sort in descending order (latest first)
      });

      setContacts(sortedContacts); // Update state with sorted contacts
    };

    fetchContacts();
  }, []);

  const handleReplyClick = (contact) => {
    setSelectedContact(contact);
  };

  const handleClosePopup = () => {
    setSelectedContact(null);
  };

  // Function to format the timestamp
  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      const date = timestamp.toDate(); // Convert Firestore Timestamp to Date
      return date.toLocaleString(); // Convert to a human-readable format
    }
    return 'Invalid Date'; // Fallback in case of an invalid timestamp
  };

  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id) // Deselect
        : [...prevSelectedRows, id] // Select
    );
  };

  const handleDeleteRow = async (id) => {
    try {
      await deleteDoc(doc(db, 'contacts', id));
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== id)
      );
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one row to delete.');
      return;
    }

    try {
      await Promise.all(
        selectedRows.map((id) => deleteDoc(doc(db, 'contacts', id)))
      );
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => !selectedRows.includes(contact.id))
      );
      setSelectedRows([]); // Clear selected rows
    } catch (error) {
      console.error('Error deleting contacts:', error);
    }
  };

  return (
    <div className="help-table">
      {/* Delete button for selected rows */}
      <div className="table-actions">
        {selectedRows.length > 0 && (
          <button className="delete-button" onClick={handleDeleteSelected}>
            Delete Selected
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelectedRows(
                    e.target.checked ? contacts.map((contact) => contact.id) : []
                  )
                }
                checked={
                  selectedRows.length > 0 &&
                  selectedRows.length === contacts.length
                }
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Date & Time</th>
            <th>Reply</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(contact.id)}
                  onChange={() => handleCheckboxChange(contact.id)}
                />
              </td>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td>{contact.subject}</td>
              <td>{contact.message}</td>
              <td>{formatTimestamp(contact.timestamp)}</td>
              <td>
                <button onClick={() => handleReplyClick(contact)}>
                  <i className="fas fa-reply"></i>
                </button>
              </td>
              <td>
                <button
                  className="delete-row-button"
                  onClick={() => handleDeleteRow(contact.id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedContact && (
        <ReplyPopup contact={selectedContact} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default HelpTable;

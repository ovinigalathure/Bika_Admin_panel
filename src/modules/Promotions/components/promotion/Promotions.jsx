import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from '../../../../firebase';
import './Promotions.css';

const Promotion = () => {
    const navigate = useNavigate(); // Initialize navigation hook
    const [promotions, setPromotions] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [sendOption, setSendOption] = useState(''); // State to manage dropdown selection
    const [tableOption, setTableOption] = useState('Admin'); // State to manage table source
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [modalMessage, setModalMessage] = useState(''); // State for modal message

    // Real-time listener for promotions from Firebase Firestore
    useEffect(() => {
        const collectionName = tableOption === 'Admin' ? 'products' : 'web-promos';

        const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
            const productsArray = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() // Include the document ID to use it for deletion
            }));
            setPromotions(productsArray); // Automatically updates state with new products
        }, (error) => {
            console.error("Error fetching promotions: ", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [tableOption]);

    const handleAddClick = () => {
        navigate('/product');
    };

    const handleCheckboxChange = (index) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter((item) => item !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    // Handle dropdown selection for send option
    const handleDropdownChange = (event) => {
        setSendOption(event.target.value);
    };

    // Handle dropdown selection for table option
    const handleTableOptionChange = (event) => {
        setTableOption(event.target.value);
    };

    // Function to delete selected items
    const handleDeleteClick = async () => {
        if (selectedItems.length === 0) {
            alert("Please select at least one item to delete.");
            return;
        }

        const collectionName = tableOption === 'Admin' ? 'products' : 'web-promos';

        if (window.confirm("Are you sure you want to delete the selected promotions?")) {
            try {
                // Create an array of promises to delete items using their document IDs
                const deletePromises = selectedItems.map(async (index) => {
                    const promoToDelete = promotions[index]; // Get the promotion object
                    const promoId = promoToDelete.id; // Extract the document ID

                    // Delete the document from Firestore
                    const docRef = doc(db, collectionName, promoId);
                    await deleteDoc(docRef);
                    console.log(`Deleted promotion: ${promoId}`);
                });

                // Wait for all deletions to complete
                await Promise.all(deletePromises);

                // After deletion, update the promotions state
                setPromotions((prevPromotions) =>
                    prevPromotions.filter((_, index) => !selectedItems.includes(index))
                );

                // Clear the selected items
                setSelectedItems([]);

                // Show success message
                setModalMessage("Selected promotions deleted successfully!");
                setIsModalOpen(true);

            } catch (error) {
                console.error("Error deleting promotions:", error);
                alert("Error deleting promotions. Please try again.");
            }
        }
    };

    // Handle sending promotions
    const handleSendClick = async () => {
        const selectedPromotions = selectedItems.map(index => promotions[index]);

        if (!sendOption) {
            alert('Please select a send option.');
            return;
        }

        // Ensure the promotions are valid before sending
        const validPromotions = selectedPromotions.filter(promo => promo.productName && promo.price && promo.discount);

        if (validPromotions.length === 0) {
            alert("No valid promotions to send.");
            return;
        }

        try {
            // Set collection based on send option
            const promotionsRef = collection(db, sendOption === 'customer' ? "customer-promos" : "web-promos");

            for (const promo of validPromotions) {
                console.log("Sending promo:", promo); // Debug log
                await addDoc(promotionsRef, {
                    productName: promo.productName,
                    image: promo.image,
                    price: promo.price,
                    discount: promo.discount,
                    description: promo.description,
                    date: promo.date,
                    time: promo.time,
                    sentAt: new Date().toISOString(),
                    type: sendOption === 'customer' ? 'customer-promotion' : 'website-promotion'
                });
            }

            // Show success message modal
            setModalMessage("Promotions sent successfully!");
            setIsModalOpen(true); // Open modal

        } catch (error) {
            console.error("Error sending promotions:", error); // Log the detailed error
            alert("Error sending promotions. Please try again.");
        }
    };

    // Modal Component
    const Modal = ({ message, onClose }) => (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{message}</h2>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );

    return (
        <div className="promotion-section">
            <h2>Promotions and Special Offers</h2>
            <div className="controls">
                <button className="control-button" onClick={handleAddClick}>
                    Add
                </button>

                {/* Delete button */}
                <button className="control-button" onClick={handleDeleteClick} disabled={selectedItems.length === 0}>
                    Delete
                </button>

                {/* Dropdown for send options */}
                <select className="control-button" value={sendOption} onChange={handleDropdownChange}>
                    <option value="">Select Send Option</option>
                    <option value="customer">Send to Customer</option>
                    <option value="website">Send to Website</option>
                </select>

                {/* Dropdown for table options */}
                <select className="control-button" value={tableOption} onChange={handleTableOptionChange}>
                    <option value="Admin">Admin</option>
                    <option value="Customer">Customer</option>
                </select>

                {/* Send button */}
                <button
                    className="control-button"
                    onClick={handleSendClick}
                    disabled={!sendOption}
                >
                    Send
                </button>
            </div>

            <table className="promotion-table">
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center' }}>
                                No promotions available
                            </td>
                        </tr>
                    ) : (
                        promotions.map((promo, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(index)}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                </td>
                                <td>
                                    <img src={promo.image} alt={promo.productName} className="promo-image-table" />
                                </td>
                                <td>{promo.productName}</td>
                                <td>{promo.price}</td>
                                <td>{promo.discount}</td>
                                <td>{promo.description}</td>
                                <td>{promo.date}</td>
                                <td>{promo.time}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Conditional rendering of the modal */}
            {isModalOpen && (
                <Modal
                    message={modalMessage}
                    onClose={() => setIsModalOpen(false)} // Close modal
                />
            )}
        </div>
    );
};

export default Promotion;

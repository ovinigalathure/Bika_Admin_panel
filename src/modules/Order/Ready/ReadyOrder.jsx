import React, { useEffect, useState } from 'react';
import './ReadyOrders.css';
import { db } from '../../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const ReadyOrders = () => {
    const [deliveryOrders, setDeliveryOrders] = useState([]);
    const [takeAwayOrders, setTakeAwayOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeOrders, setActiveOrders] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [selectedOrders, setSelectedOrders] = useState([]);

    useEffect(() => {
        const fetchDeliveryOrders = async () => {
            try {
                const deliveryCollection = collection(db, "delivery");
                const deliverySnapshot = await getDocs(deliveryCollection);
                const deliveryList = deliverySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDeliveryOrders(deliveryList);
            } catch (error) {
                console.error("Error fetching delivery orders:", error);
            }
        };

        const fetchTakeAwayOrders = async () => {
            try {
                const takeAwayCollection = collection(db, "takeAway");
                const takeAwaySnapshot = await getDocs(takeAwayCollection);
                const takeAwayList = takeAwaySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTakeAwayOrders(takeAwayList);
            } catch (error) {
                console.error("Error fetching takeAway orders:", error);
            }
        };

        fetchDeliveryOrders();
        fetchTakeAwayOrders();
    }, []);

    const openModal = (orders, title) => {
        setActiveOrders(orders);
        setModalTitle(title);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveOrders([]);
        setModalTitle('');
        setSelectedOrders([]); // Clear selection when closing modal
    };

    const toggleSelectOrder = (orderId) => {
        setSelectedOrders(prevSelectedOrders =>
            prevSelectedOrders.includes(orderId)
                ? prevSelectedOrders.filter(id => id !== orderId)
                : [...prevSelectedOrders, orderId]
        );
    };

    const handleConfirmOrders = async () => {
        try {
            for (const orderId of selectedOrders) {
                const order = activeOrders.find(order => order.id === orderId);

                // Add to `confirmedOrders` collection
                await addDoc(collection(db, "confirmedOrders"), {
                    userEmail: order.userEmail,
                    orderId: order.orderId,
                    items: order.items,
                    totalPrice: order.totalPrice,
                    timestamp: order.timestamp,
                    status: "Confirmed"
                });

                // Remove from the original collection
                const originalCollection = modalTitle === "Delivery Orders" ? "delivery" : "takeAway";
                await deleteOrderByOrderId(originalCollection, orderId);
            }

            // Update UI: Remove confirmed orders from the active orders list
            setActiveOrders(prevOrders => prevOrders.filter(order => !selectedOrders.includes(order.id)));
            setSelectedOrders([]); // Clear selected orders
        } catch (error) {
            console.error("Error confirming orders:", error);
        }
    };

    // Function to delete the document based on the orderId from the specified collection
    const deleteOrderByOrderId = async (collectionName, orderId) => {
        try {
            const q = query(collection(db, collectionName), where("orderId", "==", orderId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docRef = doc(db, collectionName, querySnapshot.docs[0].id);
                await deleteDoc(docRef);
                console.log(`Successfully deleted order with orderId: ${orderId} from ${collectionName}`);
            } else {
                console.log("No order found with the specified orderId");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    return (
        <div className="ready-orders-container">
            <h2 className='topic'>Ready Orders</h2>

            <div className="orders-cards">
                <div className="order-card" onClick={() => openModal(deliveryOrders, "Delivery Orders")}>
                    <h3>Delivery Orders</h3>
                    <p>{deliveryOrders.length} orders ready</p>
                </div>
                <div className="order-card" onClick={() => openModal(takeAwayOrders, "Take Away Orders")}>
                    <h3>Take Away Orders</h3>
                    <p>{takeAwayOrders.length} orders ready</p>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{modalTitle}</h3>
                        <button className="close-button" onClick={closeModal}>Close</button>
                        {activeOrders.length > 0 ? (
                            <>
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Select</th>
                                            <th>Order ID</th>
                                            <th>Product Names</th>
                                            <th>Customizations</th>
                                            <th>Total Price</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeOrders.map(order => (
                                            <tr key={order.id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrders.includes(order.id)}
                                                        onChange={() => toggleSelectOrder(order.id)}
                                                    />
                                                </td>
                                                <td>{order.orderId}</td>
                                                <td>{order.items.map(item => item.productName).join(", ")}</td>
                                                <td>
                                                    {order.items.map(item =>
                                                        item.customizeDetails?.length > 0
                                                            ? item.customizeDetails.map(custom => `${custom.item}(x${custom.quantity})`).join(", ")
                                                            : "None"
                                                    ).join(", ")}
                                                </td>
                                                <td>{order.totalPrice ? order.totalPrice.toFixed(2) : "N/A"}</td>
                                                <td>
                                                    {order.timestamp ? (
                                                        <>
                                                            {new Date(order.timestamp.seconds * 1000).toLocaleDateString()}{" "}
                                                            {new Date(order.timestamp.seconds * 1000).toLocaleTimeString()}
                                                        </>
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button
                                    className="confirm-button"
                                    onClick={handleConfirmOrders}
                                    disabled={selectedOrders.length === 0}
                                >
                                    Confirm Selected Orders
                                </button>
                            </>
                        ) : (
                            <p>No orders found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadyOrders;

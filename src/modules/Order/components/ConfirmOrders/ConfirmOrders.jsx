import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ConfirmOrders.css';

const ConfirmOrders = () => {
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [orderType, setOrderType] = useState('both');
  const db = getFirestore();

  useEffect(() => {
    const fetchConfirmedOrders = async () => {
      try {
        const confirmedOrdersCollection = collection(db, 'confirmedOrders');
        const confirmedOrdersSnapshot = await getDocs(confirmedOrdersCollection);
        const confirmedOrdersList = confirmedOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const delivery = confirmedOrdersList.filter(order => order.deliveryOption === 'Delivery');
        const takeaway = confirmedOrdersList.filter(order => !order.deliveryOption || order.deliveryOption === 'Takeaway');

        setDeliveryOrders(delivery);
        setTakeawayOrders(takeaway);
        setFilteredOrders(orderType === 'delivery' ? delivery : orderType === 'takeaway' ? takeaway : confirmedOrdersList);
      } catch (error) {
        console.error('Error fetching confirmed orders from Firestore:', error);
      }
    };

    fetchConfirmedOrders();
  }, [db, orderType]);

  const openModal = (orders, title) => {
    setFilteredOrders(orders);
    setModalTitle(title);
    setIsModalOpen(true);
    setSearchTerm('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFilteredOrders([]);
    setModalTitle('');
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = filteredOrders.filter(order =>
      order.orderId?.toLowerCase().includes(term.toLowerCase()) ||
      order.id.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredOrders(filtered);
  };

  const handleGenerateReport = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.setTextColor(40);
    pdf.textAlign = 'center';
    pdf.text(`Confirmed Orders Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, pdf.internal.pageSize.width / 2, 20, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setTextColor(0);
    pdf.text(`Total Order Count: ${filteredOrders.length}`, 10, 30);
    const totalIncome = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    pdf.text(`Total Income: Rs ${totalIncome.toFixed(2)}`, 10, 40);

    pdf.autoTable({
      startY: 50,
      head: [['Order ID', 'User Email', 'Product Name(s)', 'Customizations', 'Quantity', 'Price (Rs)', 'Total Price (Rs)', 'Status', 'Timestamp']],
      body: filteredOrders.map(order => [
        order.orderId || order.id,
        order.userEmail || 'No email provided',
        order.items ? order.items.map(item => item.productName).join(', ') : 'No items',
        order.items ? 
          order.items.map(item => 
            item.customizeDetails?.length > 0 
              ? item.customizeDetails.map(custom => `${custom.item}(x${custom.quantity})`).join(', ') 
              : 'None'
          ).join('; ') : 'None',
        order.items ? order.items.reduce((total, item) => total + (item.quantity || 0), 0) : 0,
        order.items ? order.items.map(item => parseFloat(item.price || 0).toFixed(2)).join(', ') : 'N/A',
        order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) : 'N/A',
        order.status || 'Confirmed',
        order.timestamp ? new Date(order.timestamp.seconds * 1000).toLocaleString() : 'No timestamp available',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255] },
      bodyStyles: { fillColor: [240, 248, 255] },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      margin: { top: 50 },
    });

    pdf.save(`Confirmed_Orders_Report_${reportType}.pdf`);
  };

  return (
    <div className="confirm-orders-container">
      <h1 className='titleConfirm'>Confirmed Orders</h1>

      <div className="controls-container">
        <select
          className="report-select"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <select
          className="order-select"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option value="both">Both</option>
          <option value="delivery">Delivery</option>
          <option value="takeaway">Takeaway</option>
        </select>

        <button className="generate-report-button" onClick={handleGenerateReport}>
          Generate {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
        </button>
      </div>

      <div className="totals">
        <p>Total Order Count: {filteredOrders.length}</p>
        <p>Total Income: Rs {filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}</p>
      </div>

      <div className="confirm-orders-cards">
        <div className="confirm-orders-card" onClick={() => openModal(deliveryOrders, 'Delivery Orders')}>
          <h3>Delivery Orders</h3>
          <p>{deliveryOrders.length} orders</p>
        </div>
        <div className="confirm-orders-card" onClick={() => openModal(takeawayOrders, 'Takeaway Orders')}>
          <h3>Takeaway Orders</h3>
          <p>{takeawayOrders.length} orders</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="confirm-orders-modal-overlay">
          <div className="confirm-orders-modal-content">
            <h3>{modalTitle}</h3>
            <button className="confirm-orders-close-button" onClick={closeModal}>Close</button>
            
            <input
              type="text"
              placeholder="Search by Order ID"
              value={searchTerm}
              onChange={handleSearch}
              className="confirm-orders-search-input"
            />

            {filteredOrders.length > 0 ? (
              <table className="confirm-orders-table" id="report-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User Email</th>
                    <th>Product Name(s)</th>
                    <th>Customizations</th>
                    <th>Quantity</th>
                    <th>Price (Rs)</th>
                    <th>Total Price (Rs)</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderId || order.id}</td>
                      <td>{order.userEmail || 'No email provided'}</td>
                      <td>{order.items ? order.items.map((item) => item.productName).join(', ') : 'No items'}</td>
                      <td>
                        {order.items ? 
                          order.items.map(item => 
                            item.customizeDetails?.length > 0 
                              ? item.customizeDetails.map(custom => `${custom.item}(x${custom.quantity})`).join(', ') 
                              : 'None'
                          ).join('; ') : 'None'}
                      </td>
                      <td>{order.items ? order.items.reduce((total, item) => total + (item.quantity || 0), 0) : 0}</td>
                      <td>
                        {order.items
                          ? order.items.map((item) =>
                              typeof item.price === 'number' ? parseFloat(item.price).toFixed(2) : item.price || 'N/A'
                            ).join(', ')
                          : 'N/A'}
                      </td>
                      <td>{order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) : 'N/A'}</td>
                      <td>{order.status || 'Confirmed'}</td>
                      <td>
                        {order.timestamp && order.timestamp.seconds
                          ? new Date(order.timestamp.seconds * 1000).toLocaleString()
                          : 'No timestamp available'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No orders found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmOrders;

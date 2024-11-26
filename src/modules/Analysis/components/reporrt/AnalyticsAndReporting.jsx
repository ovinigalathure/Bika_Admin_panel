import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { db } from '../../../../firebase'; // Adjust with your actual Firebase config path
import './AnalyticsAndReporting.css';

const AnalyticsAndReporting = () => {
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [reportType, setReportType] = useState('daily');
  const [orderType, setOrderType] = useState('both');
  const [userCount, setUserCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [deliveryStaffCount, setDeliveryStaffCount] = useState(0);
  const [kitchenStaffCount, setKitchenStaffCount] = useState(0);
  const [menuCounts, setMenuCounts] = useState([]);
  const [menuTypes, setMenuTypes] = useState([]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
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
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [orderType]);

  // Fetch user and staff data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Users
        const userCollection = collection(db, 'users');
        const userSnapshot = await getDocs(userCollection);
        setUserCount(userSnapshot.size);
        setUsers(userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  
        // Fetch Staff
        const staffCollection = collection(db, 'staff');
        const staffSnapshot = await getDocs(staffCollection);
        const staffData = staffSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStaff(staffData);
        setStaffCount(staffSnapshot.size);
  
        // Separate counts for delivery and kitchen staff
        const deliveryStaff = staffData.filter((staff) => staff.section === 'delivery');
        const kitchenStaff = staffData.filter((staff) => staff.section === 'kitchen');
        setDeliveryStaffCount(deliveryStaff.length);
        setKitchenStaffCount(kitchenStaff.length);
  
        // Fetch Menu and MenuTypes
        
        const menuCollection = collection(db, 'Menu');
        const menuSnapshot = await getDocs(menuCollection);
        const menuData = menuSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
        const menuTypeCollection = collection(db, 'menuTypes');
        const menuTypeSnapshot = await getDocs(menuTypeCollection);
        const menuTypeData = menuTypeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
        // Count menus by menuType (Updated Logic)
        const counts = menuTypeData.map((type) => ({
          menuType: type.type, // Assuming type.type contains the menu type name
          count: menuData.filter((menu) => menu.menuType === type.type).length, // Compare directly to type.type
        }));
  
        setMenuCounts(counts);
        setMenuTypes(menuTypeData);
  
        // Debugging Output (Optional)
        console.log('Menu Counts:', counts);
        console.log('Menu Types:', menuTypeData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData(); // Ensure the function is called here, outside the try block
  }, []);
  

  const handleGenerateOrdersReport = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(`Orders Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} (${orderType.charAt(0).toUpperCase() + orderType.slice(1)})`, 10, 20);

    pdf.setFontSize(14);
    const totalOrders = filteredOrders.length;
    const totalIncome = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    pdf.text(`Total Orders: ${totalOrders}`, 10, 30);
    pdf.text(`Total Income: Rs ${totalIncome.toFixed(2)}`, 10, 40);

    pdf.autoTable({
      startY: 50,
      head: [['Order ID', 'User Email', 'Product Names', 'Quantity', 'Price (Rs)', 'Total Price (Rs)', 'Status', 'Timestamp']],
      body: filteredOrders.map(order => [
        order.orderId || order.id,
        order.userEmail || 'N/A',
        order.items ? order.items.map(item => item.productName).join(', ') : 'N/A',
        order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0,
        order.items ? order.items.map(item => parseFloat(item.price || 0).toFixed(2)).join(', ') : 'N/A',
        order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) : 'N/A',
        order.status || 'Confirmed',
        order.timestamp ? new Date(order.timestamp.seconds * 1000).toLocaleString() : 'N/A',
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    pdf.save(`Orders_Report_${reportType}_${orderType}.pdf`);
  };

  const generateMenuReport = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Menu Report', 10, 20);

    pdf.setFontSize(14);
    pdf.text(`Total Menu Types: ${menuTypes.length}`, 10, 30);

    pdf.autoTable({
      startY: 40,
      head: [['Menu Type', 'Menu Count']],
      body: menuCounts.map((menuType) => [
        menuType.menuType || 'N/A',
        menuType.count,
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    pdf.save('Menu_Report.pdf');
  };

  const generateUsersReport = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Users Report', 10, 20);

    pdf.setFontSize(14);
    pdf.text(`Total Users: ${userCount}`, 10, 30);

    pdf.autoTable({
      startY: 40,
      head: [['ID', 'Name', 'Email', 'Role']],
      body: users.map((user) => [
        user.id,
        user.name || 'N/A',
        user.email || 'N/A',
        user.role || 'User',
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    pdf.save('Users_Report.pdf');
  };

  const generateStaffReport = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Staff Report', 10, 20);

    // Summary Section
    pdf.setFontSize(14);
    pdf.text(`Total Staff: ${staffCount}`, 10, 30);
    pdf.text(`Delivery Staff: ${deliveryStaffCount}`, 10, 40);
    pdf.text(`Kitchen Staff: ${kitchenStaffCount}`, 10, 50);

    // Delivery Staff Table
    pdf.text('Delivery Staff', 10, 60);
    pdf.autoTable({
      startY: 70,
      head: [['ID', 'Name', 'Email', 'Position']],
      body: staff.filter(staff => staff.section === 'delivery').map(staff => [
        staff.id,
        staff.name || 'N/A',
        staff.email || 'N/A',
        staff.position || 'Staff',
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    // Kitchen Staff Table
    const kitchenTableStartY = pdf.lastAutoTable.finalY + 10;
    pdf.text('Kitchen Staff', 10, kitchenTableStartY);
    pdf.autoTable({
      startY: kitchenTableStartY + 10,
      head: [['ID', 'Name', 'Email', 'Position']],
      body: staff.filter(staff => staff.section === 'kitchen').map(staff => [
        staff.id,
        staff.name || 'N/A',
        staff.email || 'N/A',
        staff.position || 'Staff',
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    pdf.save('Staff_Report.pdf');
  };

  return (
    <div className="analytics-container">
      {/* Top corner controls */}
      <h2 className='topico'>Order Report</h2>
      <div className="top-corner-controls">
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

        <button className="generate-order-report-button" onClick={handleGenerateOrdersReport}>
          Generate Orders Report
        </button>
      </div>

      {/* Summary Section */}
      <div className="summary">
        <p>Total Orders: {filteredOrders.length}</p>
        <p>Total Income: Rs {filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}</p>
        
      </div>

      {/* Orders Summary */}
      <div className="orders-summary">
        <div className="orders-card" onClick={() => setFilteredOrders(deliveryOrders)}>
          <h3>Delivery Orders</h3>
          <p>{deliveryOrders.length} orders</p>
        </div>
        <div className="orders-card" onClick={() => setFilteredOrders(takeawayOrders)}>
          <h3>Takeaway Orders</h3>
          <p>{takeawayOrders.length} orders</p>
        </div>
      </div>
      <h2 className='topico'>Users & Staff</h2>
      {/* User and Staff Summary */}
      <div className="user-staff-summary">
        <div className="user-card">
          <h3 className='h3'>Total Users</h3>
          <p className='pa'>{userCount} users</p>
          <button onClick={generateUsersReport} className="generate-user-report-button">
            Generate Users Report
          </button>
        </div>
        <div className="staff-card">
          <h3 className='h3'>Total Staff</h3>
          <p className='pa'>{staffCount} staff members</p>
          <button onClick={generateStaffReport} className="generate-staff-report-button">
            Generate Staff Report
          </button>
        </div>
      </div>
      <h2 className="topico">Menu Report</h2>
      <div className="menu-summary">
        <div className="menu-card">
          <h3 className='h3'>Total Menu Types</h3>
          <p className='pa'>{menuTypes.length} types</p>
          <button onClick={generateMenuReport} className="generate-staffc-report-button">
            Generate Menu Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAndReporting;

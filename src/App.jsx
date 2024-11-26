import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './modules/Dashboard/dashboard';
import Header from './modules/Dashboard/components/Header/Header';
// import Sidebar from './modules/Dashboard/components/Header/Header';
import Deliver from './modules/Deliver/deliver';
import Menu from './modules/MenuTable/menu';
import Order from './modules/Order/order';
import User from './modules/Users/user';
import Promote from './modules/Promotions/promotions';
import Payment from './modules/Payment/payment';
import Notification from './modules/Notification/notification';
import Report from './modules/Analysis/Analysis';
import HelpCenter from './modules/help/HelpCenter';
// import Read from './modules/Notification/components/read/read';
// import UnRead from './modules/Notification/components/unread/unread';
import All from './modules/Notification/components/all/all';
import Sub from './modules/Notification/components/subscribers/suscribe';
import ProductForm from './modules/product/ProductForm';
import AddProduct from './modules/MenuTable/components/menuButtons/add';
import OrderList from './modules/Order/components/OrderList/OrderList';
import OrderDetails from './modules/Order/components/OrderDetails/OrderDetails';
import PendingOrders from './modules/Order/components/pending orders/PendingOrders';
import ConfirmOrders from './modules/Order/components/ConfirmOrders/ConfirmOrders';
import ReadyOrders from './modules/Order/Ready/ReadyOrder';
import Staff from './modules/staff/staff';
import Sidebar from './modules/Dashboard/components/sidebar/Sidebar';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/head" element={<Header />} />
      <Route path="/side" element={<Sidebar />} />
      <Route path="/user" element={<User />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/order" element={<Order />} />
      <Route path="/deliver" element={<Deliver />} />
      <Route path="/promo" element={<Promote />} />
      <Route path="/pay" element={<Payment />} />
      <Route path="/not" element={<Notification />} />
      <Route path="/report" element={<Report />} />
      <Route path="/help" element={<HelpCenter />} />



      {/* <Route path="/read" element={<Read />} />
      <Route path="/unread" element={<UnRead />} /> */}
      <Route path="/all" element={<All />} />
      <Route path="/subscribe" element={<Sub />} />
      <Route path="/subscribe" element={<Sub />} />
      <Route path="/product" element={<ProductForm />} />
      <Route path="/add" element={<AddProduct />} />
      <Route path="/orders" element={<OrderList />} />
      <Route path="/order-details" element={<OrderDetails />} />
      <Route path="/pending" element={<PendingOrders />} />
      <Route path="/confirm-orders" element={<ConfirmOrders />} />
      <Route path="/ready-orders" element={<ReadyOrders />} />



      
      
      </Routes>
    </Router>
  );
}

export default App;

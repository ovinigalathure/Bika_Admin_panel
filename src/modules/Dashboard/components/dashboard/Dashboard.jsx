import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Replace with your Firebase config file path
import './Dashboard.css';

// Importing images (use your actual image paths)
import userIcon from '../../assets/1077114.png';
import foodItemsIcon from '../../assets/food.png';
import newOrdersIcon from '../../assets/new_orders.png';
import pendingOrdersIcon from '../../assets/pending.png';
import confirmOrdersIcon from '../../assets/confirm.png';
import promotionsIcon from '../../assets/promo.png';
import notificationIcon from '../../assets/not.png';

const Dashboard = () => {
  const [counts, setCounts] = useState({
    users: 0,
    foodItems: 0,
    newOrders: 0,
    pendingOrders: 0,
    confirmOrders: 0,
    promotions: 0,
    notifications: 0,
  });

  useEffect(() => {
    // Function to fetch counts from Firestore
    const fetchCounts = async () => {
      try {
        // Fetch Users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersCount = usersSnapshot.size;

        // Fetch Food Items count from Menu collection
        const foodItemsSnapshot = await getDocs(collection(db, 'Menu'));
        const foodItemsCount = foodItemsSnapshot.size;

        // Fetch New Orders count
        const newOrdersSnapshot = await getDocs(collection(db, 'orderNow'));
        const newOrdersCount = newOrdersSnapshot.size;

        // Fetch Pending Orders count
        const pendingOrdersSnapshot = await getDocs(collection(db, 'pendingOrders'));
        const pendingOrdersCount = pendingOrdersSnapshot.size;

        // Fetch Confirm Orders count
        const confirmOrdersSnapshot = await getDocs(collection(db, 'confirmedOrders'));
        const confirmOrdersCount = confirmOrdersSnapshot.size;

        // Fetch Promotions count
        const promotionsSnapshot = await getDocs(collection(db, 'promotions'));
        const promotionsCount = promotionsSnapshot.size;

        // Calculate Notifications count from Comments and Subscribers collections
        const commentsSnapshot = await getDocs(collection(db, 'Comments'));
        const subscribersSnapshot = await getDocs(collection(db, 'subscribers'));
        const notificationsCount = commentsSnapshot.size + subscribersSnapshot.size;

        // Update state with fetched counts
        setCounts({
          users: usersCount,
          foodItems: foodItemsCount,
          newOrders: newOrdersCount,
          pendingOrders: pendingOrdersCount,
          confirmOrders: confirmOrdersCount,
          promotions: promotionsCount,
          notifications: notificationsCount,
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const items = [
    { name: 'Users', icon: userIcon, route: '/user', count: counts.users },
    { name: 'Food items', icon: foodItemsIcon, route: '/menu', count: counts.foodItems },
    { name: 'New Orders', icon: newOrdersIcon, route: '/orders', count: counts.newOrders },
    { name: 'Pending orders', icon: pendingOrdersIcon, route: '/pending', count: counts.pendingOrders },
    { name: 'Confirm orders', icon: confirmOrdersIcon, route: '/confirm-orders', count: counts.confirmOrders },
    { name: 'Promotions', icon: promotionsIcon, route: '/promo', count: counts.promotions },
    { name: 'Notification', icon: notificationIcon, route: '/not', count: counts.notifications },
  ];

  // Splitting items into rows
  const rows = [];
  for (let i = 0; i < items.length; i += 4) {
    rows.push(items.slice(i, i + 4));
  }

  return (
    <table className="dashboard">
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((item, index) => (
              <td key={index} className="dashboard__item">
                <Link to={item.route} className="dashboard__link">
                  <img src={item.icon} alt={item.name} className="dashboard__icon" />
                  <span>{item.name}</span>
                  {item.count !== null && <span className="dashboard__count">{item.count}</span>}
                </Link>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Dashboard;

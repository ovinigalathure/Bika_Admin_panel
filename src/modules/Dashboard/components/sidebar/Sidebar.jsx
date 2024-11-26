import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.jpg";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar__logo">
        <img src={logo} alt="Biriyani Kade" />
      </div>
      <div className="sidebar__email">bikaembilipitiya@gmail.com</div>
      <ul className="sidebar__menu">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            User
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/staff"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            Staff
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/menu"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            Menu
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/order"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            Order
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/promo"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            Promotions
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/not"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            Notification
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/help"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            Help Center
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/report"
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            Report
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

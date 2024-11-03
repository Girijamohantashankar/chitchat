import React from 'react';
import { FaComments, FaUsers, FaPhone, FaCog } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <ul className="footer-menu">
        <li className="footer-item">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaComments className="footer-icon" />
            <span>Chats</span>
          </NavLink>
        </li>
        <li className="footer-item">
          <NavLink to="/communities" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaUsers className="footer-icon" />
            <span>Communities</span>
          </NavLink>
        </li>
        <li className="footer-item">
          <NavLink to="/calls" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaPhone className="footer-icon" />
            <span>Calls</span>
          </NavLink>
        </li>
        <li className="footer-item">
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaCog className="footer-icon" />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../logo.png";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src={Logo} width={25} />
          <span>Resume Matcher</span>
        </div>
        <div className="header-actions">
          <div className="user-profile-container" ref={dropdownRef}>
            <div
              className="user-profile"
              onClick={toggleDropdown}
              title="User menu"
            >
              <i className="fas fa-user-circle"></i>
              <span className="user-name">{user?.name}</span>
              <i
                className={`fas fa-chevron-down dropdown-arrow ${
                  showDropdown ? "rotated" : ""
                }`}
              ></i>
            </div>
            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-item user-info">
                  <div className="user-details">
                    <span className="user-display-name">{user?.name}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                </div>
                <hr className="dropdown-divider" />
                <button
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

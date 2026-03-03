import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import ManualModal from "./ManualModal";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (!navbar) return;
      navbar.style.background =
        window.scrollY > 50
          ? "rgba(255, 255, 255, 0.98)"
          : "rgba(255, 255, 255, 0.95)";
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <a
            href="#"
            className="nav-logo"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              navigate("/dashboard");
            }}
          >
            ACDC HR
          </a>

          <div
            className={`nav-toggle ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
            <li>
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  navigate("/dashboard");
                }}
              >
                Home
              </a>
            </li>

            <li>
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  navigate("/employees");
                }}
              >
                Employees
              </a>
            </li>

            <li>
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  navigate("/add-employee");
                }}
              >
                Add Employee
              </a>
            </li>

            <li>
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  navigate("/dashboard");
                }}
              >
                Support
              </a>
            </li>

            {isAuthenticated && (
              <li>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    navigate("/register");
                  }}
                >
                  Register
                </a>
              </li>
            )}

            {isAuthenticated && (
              <li className="logout-item">
                <a
                  href="#"
                  className="nav-link logout-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogoutModalOpen(true);
                  }}
                >
                  Logout
                </a>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <ManualModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        message="Are you sure you want to end your session? You will need to log in again to access the HR portal."
        confirmText="Logout"
        type="primary"
      />
    </>
  );
};

export default Navigation;

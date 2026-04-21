import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMenu, HiOutlineX, HiOutlineBell, HiOutlineLogout, HiOutlineUser, HiOutlineTicket, HiOutlineViewGrid } from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'organizer': return '/organizer';
      default: return '/';
    }
  };

  const navLinks = [
    { path: '/', label: 'Events', public: true },
  ];

  if (isAuthenticated) {
    if (user?.role === 'organizer' || user?.role === 'admin') {
      navLinks.push({ path: getDashboardLink(), label: 'Dashboard' });
    }
    navLinks.push({ path: '/my-tickets', label: 'My Tickets' });
  }

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" id="navbar-brand">
          <span className="navbar-logo">🎪</span>
          <span className="navbar-title">CampusEvents</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'navbar-links-open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname === link.path ? 'navbar-link-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="navbar-icon-btn" id="notifications-btn" title="Notifications">
                <HiOutlineBell size={22} />
              </Link>

              <div className="navbar-profile-wrapper">
                <button
                  className="navbar-profile-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  id="profile-btn"
                >
                  <div className="navbar-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="navbar-user-name">{user?.name?.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="navbar-dropdown animate-fade-in-scale" id="profile-dropdown">
                    <div className="navbar-dropdown-header">
                      <p className="navbar-dropdown-name">{user?.name}</p>
                      <p className="navbar-dropdown-email">{user?.email}</p>
                      <span className={`badge badge-primary`}>{user?.role}</span>
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <Link to="/profile" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)}>
                      <HiOutlineUser size={18} /> Profile
                    </Link>
                    <Link to="/my-tickets" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)}>
                      <HiOutlineTicket size={18} /> My Tickets
                    </Link>
                    {(user?.role === 'organizer' || user?.role === 'admin') && (
                      <Link to={getDashboardLink()} className="navbar-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <HiOutlineViewGrid size={18} /> Dashboard
                      </Link>
                    )}
                    <div className="navbar-dropdown-divider" />
                    <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                      <HiOutlineLogout size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm" id="login-btn">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">Sign Up</Link>
            </div>
          )}

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

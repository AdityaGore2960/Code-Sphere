import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Home, Search, Bell, User as UserIcon, LogOut, Plus, Archive, Smile, Book, Star, Users, Heart, Settings as SettingsIcon, Accessibility, ChevronDown, X, Info, MessageSquare, Layout, Briefcase } from 'lucide-react';
import { ChatState } from '../context/ChatContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setSelectedChat } = ChatState();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusExpiry, setStatusExpiry] = useState('Never');
  const [statusVisibility, setStatusVisibility] = useState('Everyone');
  const [isBusy, setIsBusy] = useState(false);
  const [isSettingStatus, setIsSettingStatus] = useState(false);
  const dropdownRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user?.token) return; // Guard: don't fetch without a valid token
    try {
      const { data } = await axios.get('/api/notifications');
      const count = data.filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Notification fetch error:', err);
      }
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  const suggestions = [
    { emoji: '🌴', text: 'On vacation' },
    { emoji: '🤕', text: 'Out sick' },
    { emoji: '🏠', text: 'Working from home' },
    { emoji: '🎯', text: 'Focusing' },
  ];

  const handleSetStatus = async () => {
    setIsSettingStatus(true);
    try {
      await axios.put('users/status', {
        message: statusText,
        busy: isBusy,
        expiry: statusExpiry,
        visibility: statusVisibility
      });
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSettingStatus(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const navItems = [
    { to: '/', icon: <Home size={22} />, title: 'Home' },
    { to: '/showcase', icon: <Layout size={22} />, title: 'Showcase' },
    { to: '/repositories', icon: <Archive size={22} />, title: 'All Repos' },
    { to: '/jobs', icon: <Briefcase size={22} />, title: 'Jobs' },
    { to: '/create-repo', icon: <Plus size={22} />, title: 'New Repo' },
    { to: '/notifications', icon: <Bell size={22} />, title: 'Notifications' },
  ];


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-bg)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container nav-content">
        <Link to="/" className="logo" style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>CodeSphere</Link>

        <form onSubmit={handleSearch} className="nav-search-bar" style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search CodeSphere..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', color: 'var(--text)', fontSize: '0.9rem' }}
          />
        </form>

        <div className="nav-links" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', position: 'relative' }} ref={dropdownRef}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.title}
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
              style={{ padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              {item.icon}
              {item.title === 'Notifications' && unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  right: '2px', 
                  background: '#ef4444', 
                  color: 'white', 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  borderRadius: '50%', 
                  width: '16px', 
                  height: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid var(--card-bg)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}


          <button
            title="Messaging"
            onClick={() => {
              // We'll use a custom event or context to open the drawer
              window.dispatchEvent(new CustomEvent('toggle-messaging'));
            }}
            className="nav-link-item"
            style={{ padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <MessageSquare size={22} />
          </button>


          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.5rem' }}></div>

          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`nav-profile-trigger ${isDropdownOpen ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', padding: '0.25rem', borderRadius: '50px' }}
          >
            <img
              src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt="Profile"
              style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <ChevronDown size={14} color="var(--text-light)" />
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="dropdown-menu shadow-xl" 
                style={{ position: 'absolute', top: '130%', right: 0, width: '300px', padding: '0.5rem', zIndex: 1000, background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              >
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Signed in as</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="" />
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="dropdown-item-btn" 
                  onClick={() => { setIsStatusModalOpen(true); setIsDropdownOpen(false); }}
                  style={{ margin: '0 0.5rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-light)' }}
                >
                  <Smile size={18} />
                  <span>Set status</span>
                </div>

                <div style={{ borderBottom: '1px solid var(--border)', margin: '0.5rem 0' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Link to={`/profile/${user.username}`} className="dropdown-item-link" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem' }}>
                    <UserIcon size={18} /> Your profile
                  </Link>
                  <Link to="/repositories" className="dropdown-item-link" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem' }}>
                    <Book size={18} /> Your repositories
                  </Link>
                  <Link to={`/profile/${user.username}?tab=stars`} className="dropdown-item-link" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem' }}>
                    <Star size={18} /> Your stars
                  </Link>
                  <div className="dropdown-item-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--text)', fontSize: '0.9rem' }}><Users size={18} /> Your organizations</div>
                  <div className="dropdown-item-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--text)', fontSize: '0.9rem' }}><Heart size={18} /> Your sponsors</div>
                </div>

                <div style={{ borderBottom: '1px solid var(--border)', margin: '0.5rem 0' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Link to="/settings" className="dropdown-item-link" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem' }}>
                    <SettingsIcon size={18} /> Settings
                  </Link>
                  <div className="dropdown-item-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--text)', fontSize: '0.9rem' }}><Accessibility size={18} /> Accessibility</div>
                </div>

                <div style={{ borderBottom: '1px solid var(--border)', margin: '0.5rem 0' }}></div>

                <div className="dropdown-item-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem' }} onClick={() => { logout(); navigate('/login'); setIsDropdownOpen(false); }}>
                  <LogOut size={18} /> Sign out
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* High-Fidelity Status Modal */}
      <AnimatePresence>
        {isStatusModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="status-modal-card" 
              style={{ width: '100%', maxWidth: '480px', background: '#0d1117', color: '#c9d1d9', borderRadius: '12px', border: '1px solid #30363d', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #30363d' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Edit status</span>
                <button onClick={() => setIsStatusModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b949e' }}><X size={20} /></button>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f0f6fc' }}>What's happening?</p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button style={{ width: '38px', height: '38px', borderRadius: '6px', border: '1px solid #30363d', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Smile size={18} color="#8b949e" />
                    </button>
                    <input 
                      type="text" 
                      value={statusText} 
                      onChange={(e) => setStatusText(e.target.value.slice(0, 80))} 
                      placeholder="What's happening?" 
                      style={{ flex: 1, height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc', outline: 'none' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>{80 - statusText.length} characters remaining</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {suggestions.map((s) => (
                    <button 
                      key={s.text}
                      onClick={() => setStatusText(s.text)}
                      style={{ padding: '0.3rem 0.6rem', borderRadius: '20px', border: '1px solid #30363d', background: '#21262d', color: '#c9d1d9', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <span>{s.emoji}</span> {s.text}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.5rem 0' }}>
                  <input 
                    type="checkbox" 
                    id="busy" 
                    checked={isBusy} 
                    onChange={(e) => setIsBusy(e.target.checked)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <label htmlFor="busy" style={{ cursor: 'pointer' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f6fc' }}>Busy</p>
                    <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '0.2rem', lineHeight: 1.4 }}>When others mention you, assign you, or request your review, CodeSphere will let them know that you have limited availability.</p>
                  </label>
                </div>

                <div style={{ borderTop: '1px solid #30363d', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f0f6fc' }}>Expiration</label>
                    <select 
                      value={statusExpiry}
                      onChange={(e) => setStatusExpiry(e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid #30363d', background: '#21262d', color: '#f0f6fc', outline: 'none', cursor: 'pointer' }}
                    >
                      <option>Never</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>Today</option>
                      <option>This week</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '0.4rem' }}>Your status will be cleared after the selected time.</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f0f6fc' }}>Visible to</label>
                    <select 
                      value={statusVisibility}
                      onChange={(e) => setStatusVisibility(e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid #30363d', background: '#21262d', color: '#f0f6fc', outline: 'none', cursor: 'pointer' }}
                    >
                      <option>Everyone</option>
                      <option>Followers</option>
                      <option>Only me</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '0.4rem' }}>Limit status visibility to specific audiences.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button 
                    onClick={() => { setStatusText(''); setIsStatusModalOpen(false); }}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #30363d', background: '#21262d', color: '#c9d1d9', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Clear status
                  </button>
                  <button 
                    disabled={isSettingStatus}
                    onClick={handleSetStatus}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#238636', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {isSettingStatus ? 'Saving...' : 'Set status'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

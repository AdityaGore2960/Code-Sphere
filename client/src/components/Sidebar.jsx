import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Users, Bookmark, Settings, MapPin, Link as LinkIcon } from 'lucide-react';

const Sidebar = ({ user }) => {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* User Info Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', height: '80px' }}></div>
      <div style={{ padding: '0 1.5rem 1.5rem', marginTop: '-40px', textAlign: 'center' }}>
        <Link to={`/profile/${user.username}`}>
          <img 
            src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
            alt={user.username} 
            style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid white', background: 'white' }} 
          />
        </Link>
        <h3 style={{ marginTop: '0.5rem' }}>{user.username}</h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '1rem' }}>{user.bio || 'No bio yet'}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.75rem 0', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem' }}>{user.followers?.length || 0}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Followers</p>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', height: '100%' }}></div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem' }}>{user.following?.length || 0}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Following</p>
          </div>
        </div>

        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
            <Users size={18} /> My Network
          </Link>
          <Link to="/showcase" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
            <Code size={18} /> My Projects
          </Link>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
            <Bookmark size={18} /> Bookmarks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

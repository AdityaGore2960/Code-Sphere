import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Monitor, Bell, Mail, Key, Clock, Users, Book, Cpu, MessageSquare, ShieldAlert, AppWindow, Calendar, Code, ChevronRight, Camera, Link as LinkIcon, MapPin, Building } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('Public profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    pronouns: user?.pronouns || '',
    url: user?.url || '',
    company: user?.company || '',
    location: user?.location || '',
    socials: user?.socials || { github: '', twitter: '', linkedin: '' }
  });

  const sidebarItems = [
    { name: 'Public profile', icon: <User size={18} /> },
    { name: 'Account', icon: <Shield size={18} /> },
    { name: 'Appearance', icon: <Monitor size={18} /> },
    { name: 'Accessibility', icon: <Cpu size={18} /> },
    { name: 'Notifications', icon: <Bell size={18} /> },
    { name: 'Emails', icon: <Mail size={18} /> },
    { name: 'Password and authentication', icon: <Key size={18} /> },
    { name: 'Sessions', icon: <Clock size={18} /> },
    { name: 'Organizations', icon: <Users size={18} /> },
    { name: 'Repositories', icon: <Book size={18} /> },
    { name: 'Codespace', icon: <Cpu size={18} /> },
    { name: 'Saved replies', icon: <MessageSquare size={18} /> },
    { name: 'Code security', icon: <ShieldAlert size={18} /> },
    { name: 'Applications', icon: <AppWindow size={18} /> },
    { name: 'Scheduled reminders', icon: <Calendar size={18} /> },
    { name: 'Developer settings', icon: <Code size={18} /> },
  ];

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', gap: '2rem', padding: '2rem 0' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', paddingLeft: '0.75rem' }}>User Settings</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveSection(item.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: activeSection === item.name ? 'var(--text)' : 'var(--text-light)',
                background: activeSection === item.name ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                fontWeight: activeSection === item.name ? 600 : 400,
                borderLeft: activeSection === item.name ? '3px solid var(--primary)' : '3px solid transparent',
                textAlign: 'left'
              }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '800px' }}>
        {activeSection === 'Public profile' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Existing Public Profile Content */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Public profile</h1>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="input-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="email">Public email</label>
                    <select
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    >
                      <option value={user?.email}>{user?.email}</option>
                      <option value="">Don't show my email</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.4rem' }}>You can change which email addresses are visible on your profile.</p>
                  </div>
                  <div className="input-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="4"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us a little bit about yourself"
                    ></textarea>
                  </div>
                  <div className="input-group">
                    <label htmlFor="pronouns">Pronouns</label>
                    <select
                      id="pronouns"
                      name="pronouns"
                      value={formData.pronouns}
                      onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                    >
                      <option value="">Don't specify</option>
                      <option value="they/them">they/them</option>
                      <option value="she/her">she/her</option>
                      <option value="he/him">he/him</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="url">URL</label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                      <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                      <label htmlFor="company">Company</label>
                      <div style={{ position: 'relative' }}>
                        <Building size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label htmlFor="location">Location</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Update profile</button>
                </div>
                <div style={{ width: '200px', textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Profile picture</label>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={user?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Avatar" style={{ width: '200px', height: '200px', borderRadius: '50%', border: '1px solid var(--border)', objectFit: 'cover' }} />
                    <button style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#fff', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow)' }}>
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        ) : activeSection === 'Account' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Account settings</h1>
            </div>

            {/* Change Username Section */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Change username</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                Changing your username can have unintended side effects.
              </p>
              <div className="input-group" style={{ maxWidth: '400px' }}>
                <label htmlFor="new-username">New username</label>
                <input type="text" id="new-username" name="new-username" placeholder={user?.username} />
              </div>
              <button className="btn btn-outline" style={{ marginTop: '0.5rem' }}>Change username</button>
            </div>

            <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '3rem' }}></div>

            {/* Export Data Section */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Export account data</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                Export all your repositories, profile information, and contributions.
              </p>
              <button className="btn btn-outline" onClick={() => alert('Data export started!')}>Start export</button>
            </div>

            <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '3rem' }}></div>

            {/* Delete Account Section (Danger Zone) */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ff4444', marginBottom: '0.5rem' }}>Delete account</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                className="btn btn-primary"
                style={{ background: '#ff4444', borderColor: '#ff4444' }}
                onClick={() => {
                  if (window.confirm('Are you absolutely sure?')) {
                    alert('Account deletion initiated.');
                  }
                }}
              >
                Delete your account
              </button>
            </div>
          </motion.div>
        ) : activeSection === 'Appearance' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Appearance</h1>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Theme</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                Select how CodeSphere looks to you.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '600px' }}>
                {/* Light Theme Option */}
                <div
                  onClick={() => {
                    document.documentElement.classList.remove('dark-theme');
                    localStorage.setItem('theme', 'light');
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: !document.documentElement.classList.contains('dark-theme') ? '2px solid var(--primary)' : '2px solid var(--border)',
                    background: '#fff',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ height: '100px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', overflow: 'hidden', padding: '0.5rem' }}>
                    <div style={{ height: '8px', width: '60%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '6px' }}></div>
                    <div style={{ height: '8px', width: '40%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '6px' }}></div>
                    <div style={{ height: '20px', width: '100%', background: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0' }}></div>
                  </div>
                  <p style={{ fontWeight: 600, textAlign: 'center', color: '#1e293b' }}>Light</p>
                </div>

                {/* Dark Theme Option */}
                <div
                  onClick={() => {
                    document.documentElement.classList.add('dark-theme');
                    localStorage.setItem('theme', 'dark');
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: document.documentElement.classList.contains('dark-theme') ? '2px solid var(--primary)' : '2px solid var(--border)',
                    background: '#0d1117',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ height: '100px', background: '#161b22', borderRadius: '6px', border: '1px solid #30363d', marginBottom: '0.75rem', overflow: 'hidden', padding: '0.5rem' }}>
                    <div style={{ height: '8px', width: '60%', background: '#30363d', borderRadius: '4px', marginBottom: '6px' }}></div>
                    <div style={{ height: '8px', width: '40%', background: '#30363d', borderRadius: '4px', marginBottom: '6px' }}></div>
                    <div style={{ height: '20px', width: '100%', background: '#0d1117', borderRadius: '4px', border: '1px solid #30363d' }}></div>
                  </div>
                  <p style={{ fontWeight: 600, textAlign: 'center', color: '#c9d1d9' }}>Dark</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <SettingsIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>{activeSection} settings coming soon</h3>
              <p>We are currently building this section. Stay tuned!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;

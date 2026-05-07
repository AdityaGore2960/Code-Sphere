import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/notifications');
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={18} color="#ef4444" fill="#ef4444" />;
      case 'comment': return <MessageCircle size={18} color="var(--primary)" />;
      case 'follow': return <UserPlus size={18} color="#10b981" />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Notifications</h1>
      <div className="card" style={{ padding: '0' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
        ) : notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif._id} style={{ display: 'flex', gap: '1rem', padding: '1.25rem', borderBottom: '1px solid var(--border)', background: notif.isRead ? 'transparent' : 'var(--primary-light)' }}>
              <div style={{ marginTop: '0.25rem' }}>{getIcon(notif.type)}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.95rem' }}>
                  <Link to={`/profile/${notif.sender.username}`} style={{ fontWeight: 700 }}>{notif.sender.username}</Link>
                  {' '}
                  {notif.type === 'like' && 'liked your post'}
                  {notif.type === 'comment' && 'commented on your post'}
                  {notif.type === 'follow' && 'started following you'}
                </p>
                {notif.post && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.2rem', fontStyle: 'italic' }}>"{notif.post.content.substring(0, 50)}..."</p>}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.4rem' }}>{formatDistanceToNow(new Date(notif.createdAt))} ago</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>No notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Heart, MessageCircle, UserPlus, MessageSquare } from 'lucide-react';
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
      
      // Mark unread notifications as read
      data.forEach(async (n) => {
        if (!n.isRead) {
          await axios.put(`/notifications/${n._id}/read`);
        }
      });
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
      case 'comment': return <MessageCircle size={18} color="#0a66c2" />;
      case 'follow': return <UserPlus size={18} color="#057642" />;
      case 'message': return <MessageSquare size={18} color="#0a66c2" />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Notifications</h1>
      <div style={{ background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
             <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif._id} style={{ 
              display: 'flex', 
              gap: '12px', 
              padding: '16px', 
              borderBottom: '1px solid var(--border)', 
              background: notif.isRead ? 'transparent' : 'rgba(10, 102, 194, 0.05)',
              transition: 'background 0.2s'
            }}>
              <Link to={`/profile/${notif.sender.username}`}>
                <img 
                  src={notif.sender.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.sender.username}`} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                  alt={notif.sender.username} 
                />
              </Link>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.4' }}>
                  <Link to={`/profile/${notif.sender.username}`} style={{ fontWeight: 700, textDecoration: 'none', color: 'var(--text)' }}>
                    {notif.sender.username}
                  </Link>
                  {' '}
                  {notif.type === 'like' && 'liked your post'}
                  {notif.type === 'comment' && 'commented on your post'}
                  {notif.type === 'follow' && 'started following you'}
                  {notif.type === 'message' && 'sent you a new message'}
                </p>
                {notif.post && (
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {notif.post.content}
                        </p>
                    </Link>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '6px' }}>
                    {formatDistanceToNow(new Date(notif.createdAt))} ago
                </p>
              </div>
              <div style={{ alignSelf: 'center' }}>{getIcon(notif.type)}</div>
            </div>
          ))
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Bell size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-light)' }}>No notifications yet. When people interact with you, you'll see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

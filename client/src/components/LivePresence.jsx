import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const LivePresence = () => {
  const { onlineUsers } = useSocket();

  return (
    <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="var(--primary)" /> Live Presence
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
          <Circle size={8} fill="#10b981" color="#10b981" />
          <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>{onlineUsers.length} Online</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
        {onlineUsers.length > 0 ? (
          onlineUsers.map((u, index) => (
            <motion.div 
              key={u.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ position: 'relative' }}>
                <img 
                  src={u.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)' }} 
                  alt="" 
                />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', border: '2px solid white' }}></div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</p>
                <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Active now</p>
              </div>
            </motion.div>
          ))
        ) : (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center', padding: '1rem' }}>No users online</p>
        )}
      </div>
    </div>
  );
};

export default LivePresence;

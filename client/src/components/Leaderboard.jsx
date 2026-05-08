import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Award, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await axios.get('challenges/leaderboard');
        setLeaders(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>Loading leaderboard...</div>;

  return (
    <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={18} color="#f59e0b" /> Leaderboard
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Top 10</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {leaders.map((user, index) => (
          <motion.div 
            key={user._id} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div style={{ width: '24px', textAlign: 'center', fontWeight: 800, color: index < 3 ? 'var(--primary)' : 'var(--text-light)', fontSize: '0.9rem' }}>
              {index === 0 ? <Crown size={16} color="#fbbf24" /> : index + 1}
            </div>
            <img 
              src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
              alt="" 
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{user.points} pts</p>
            </div>
            {index < 3 && <Award size={16} color={index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309'} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

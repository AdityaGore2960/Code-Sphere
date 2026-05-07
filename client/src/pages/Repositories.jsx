import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, Star, GitFork, Search, Filter, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Repositories = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const { data } = await axios.get('/repos');
        
        // Trial repositories for consistency with Profile page
        const trialRepos = [
          {
            _id: 'trial-1',
            name: 'CodeSphere-Core',
            description: 'The core architecture for the CodeSphere developer social platform. High-performance, scalable, and modular.',
            stargazers_count: 124,
            forks_count: 42,
            language: 'JavaScript',
            owner: { username: 'System', profilePic: 'https://api.dicebear.com/7.x/identicon/svg?seed=System' },
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'trial-2',
            name: 'DevPulse-Analytics',
            description: 'A real-time data visualization engine for tracking developer contributions and community growth metrics.',
            stargazers_count: 89,
            forks_count: 18,
            language: 'TypeScript',
            owner: { username: 'System', profilePic: 'https://api.dicebear.com/7.x/identicon/svg?seed=System' },
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'trial-3',
            name: 'Astra-UI-Library',
            description: 'A premium, accessible component library designed specifically for data-intensive developer tools and dashboards.',
            stargazers_count: 215,
            forks_count: 31,
            language: 'React',
            owner: { username: 'System', profilePic: 'https://api.dicebear.com/7.x/identicon/svg?seed=System' },
            updatedAt: new Date().toISOString()
          }
        ];

        setRepos([...data, ...trialRepos]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const filteredRepos = repos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) || 
                          repo.description?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container" style={{ padding: '3rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Explore Repositories</h1>
          <p style={{ color: 'var(--text-light)' }}>Discover projects and libraries built by the community.</p>
        </div>
        <Link to="/create-repo" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} /> New Repository
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', background: '#fff' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input 
            type="text" 
            placeholder="Search projects by name or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <p style={{ color: 'var(--text-light)' }}>Loading repositories...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredRepos.map(repo => (
            <motion.div 
              key={repo._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card" 
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border)', transition: 'var(--transition)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '8px' }}>
                  <Book size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <Link to={`/repo/${repo.owner.username}/${repo.name}`} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {repo.name}
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>by</span>
                    <Link to={`/profile/${repo.owner.username}`} style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <img src={repo.owner.profilePic || `https://ui-avatars.com/api/?name=${repo.owner.username}`} style={{ width: '16px', height: '16px', borderRadius: '50%' }} alt="" />
                      {repo.owner.username}
                    </Link>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '2rem', flex: 1, lineHeight: 1.6 }}>
                {repo.description || 'No description provided for this project.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={16} /> {repo.stargazers_count}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><GitFork size={16} /> {repo.forks_count}</span>
                </div>
                {repo.language && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                    {repo.language}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {filteredRepos.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>No repositories found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Repositories;

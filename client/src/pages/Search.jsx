import React, { useState } from 'react';
import axios from 'axios';
import { Search as SearchIcon, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/users/search?query=${query}`);
      setResults(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Search Developers</h1>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <input 
            type="text" 
            placeholder="Search by username or skill..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary"><SearchIcon size={20} /> Search</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <p>Searching...</p> : results.map(user => (
          <div key={user._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt="" 
                style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
              />
              <div>
                <Link to={`/profile/${user.username}`} style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.username}</Link>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{user.bio || 'Developer'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {user.skills?.slice(0, 3).map(skill => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          </div>
        ))}
        {!loading && query && results.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No developers found.</p>}
      </div>
    </div>
  );
};

export default Search;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Search, Filter, Code } from 'lucide-react';

const Showcase = () => {
  const [projects, setProjects] = useState([]);
  const [tech, setTech] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProjects = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/posts/projects?tech=${query}`);
      setProjects(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects(tech);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
        <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Code size={32} color="var(--primary)" /> Project Showcase
        </h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Discover amazing projects built by the community. Filter by technology to find what interests you.</p>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input 
                type="text" 
                placeholder="Search by tech stack (e.g. React, Python, AI)..." 
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <Filter size={18} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading projects...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
          {projects.length > 0 ? projects.map(project => (
            <PostCard key={project._id} post={project} />
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-light)' }}>No projects found matching that tech stack.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Showcase;

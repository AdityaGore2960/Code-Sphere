import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Code, ExternalLink, Heart, MessageCircle, Share2, Layers, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const Showcase = () => {
  const [projects, setProjects] = useState([]);
  const [tech, setTech] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Web', 'Mobile', 'AI/ML', 'Blockchain', 'Games', 'Open Source'];

  const fetchProjects = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/posts/projects?tech=${query}`);
      setProjects(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(activeCategory === 'All' ? '' : activeCategory);
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects(tech);
  };

  return (
    <div className="showcase-page" style={{ paddingBottom: '5rem' }}>
      {/* Hero Header */}
      <div className="card" style={{ 
        marginBottom: '2.5rem', 
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
        color: 'white',
        padding: '3rem',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Project Showcase
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
            Explore the next generation of software. Built by developers, for developers. 
            Behance for the coding community.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }} onClick={() => navigate('/')}>
              <Plus size={18} /> Submit Project
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              Learn More
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', right: '50px', bottom: '-80px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
      </div>

      {/* Filter & Categories Bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              style={{ 
                padding: '0.5rem 1.25rem', 
                borderRadius: '50px', 
                border: activeCategory === cat ? 'none' : '1px solid var(--border)', 
                background: activeCategory === cat ? 'var(--primary)' : 'white',
                color: activeCategory === cat ? 'white' : 'var(--text-light)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '400px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search tech stack..." 
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              style={{ paddingLeft: '2.8rem', borderRadius: '50px', height: '42px', border: '1px solid var(--border)', width: '100%' }}
            />
          </div>
        </form>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Curating the best projects...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {projects.length > 0 ? projects.map(project => (
            <ProjectCard key={project._id} project={project} />
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', background: 'var(--bg)', borderRadius: '12px' }}>
              <Layers size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text)' }}>No projects found</h3>
              <p style={{ color: 'var(--text-light)' }}>Be the first to showcase a project in this category!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        background: 'white', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        border: '1px solid var(--border)',
        boxShadow: isHovered ? '0 15px 30px rgba(0,0,0,0.1)' : 'var(--shadow)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Project Thumbnail */}
      <div style={{ height: '200px', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={project.image || (project.images && project.images[0]) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600'} 
          alt={project.content} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className={isHovered ? 'scale-105' : ''}
        />
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
            >
              {project.githubLink && (
                <a href={project.githubLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="btn-icon" style={{ background: 'white', color: '#000', borderRadius: '50%', padding: '0.75rem' }}>
                  <Code size={20} />
                </a>
              )}
              {project.demoLink && (
                <a href={project.demoLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="btn-icon" style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '0.75rem' }}>
                  <ExternalLink size={20} />
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.9)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
          Project
        </div>
      </div>

      {/* Project Details */}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <img 
            src={project.user?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.user?.username}`} 
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            alt=""
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{project.user?.username}</span>
        </div>
        
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.content.split('\n')[0].substring(0, 50)}
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {(project.techStack || []).slice(0, 3).map(tech => (
            <span key={tech} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--bg)', borderRadius: '4px', color: 'var(--text-light)', border: '1px solid var(--border)' }}>
              {tech}
            </span>
          ))}
          {(project.techStack?.length > 3) && <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>+{project.techStack.length - 3}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>
              <Heart size={16} /> {project.likes?.length || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>
              <MessageCircle size={16} /> {project.comments?.length || 0}
            </span>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Showcase;

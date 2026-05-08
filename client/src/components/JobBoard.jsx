import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, DollarSign, ExternalLink, Filter, Search, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    type: 'Full-time',
    location: '',
    salary: '',
    description: '',
    link: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get('jobs');
      setJobs(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post('jobs', newJob);
      fetchJobs();
      setShowAddModal(false);
      setNewJob({ title: '', company: '', type: 'Full-time', location: '', salary: '', description: '', link: '' });
    } catch (err) {
      console.error(err);
      alert('Error creating job');
    }
  };

  const filteredJobs = filter === 'All' ? jobs : jobs.filter(job => job.type === filter);

  if (loading) return <div className="card" style={{ padding: '1.5rem' }}>Loading opportunities...</div>;

  return (
    <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Briefcase size={20} color="var(--primary)" /> Job Board
        </h3>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ color: 'var(--primary)', cursor: 'pointer' }}
          title="Post a Job"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['All', 'Full-time', 'Internship', 'Freelance'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: filter === t ? 'var(--primary)' : 'var(--primary-light)',
              color: filter === t ? 'white' : 'var(--primary)',
              whiteSpace: 'nowrap'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredJobs.slice(0, 5).map((job, idx) => (
          <motion.div 
            key={job._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{ paddingBottom: '1rem', borderBottom: idx !== filteredJobs.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{job.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{job.company}</p>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--bg)', borderRadius: '4px', fontWeight: 600 }}>{job.type}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={14} /> {job.location}
              </span>
              {job.salary && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <DollarSign size={14} /> {job.salary}
                </span>
              )}
            </div>

            <a 
              href={job.link} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-outline" 
              style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center' }}
            >
              Apply Now <ExternalLink size={14} />
            </a>
          </motion.div>
        ))}
        
        {filteredJobs.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem', padding: '1rem' }}>No opportunities found.</p>
        )}
      </div>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card" 
              style={{ width: '100%', maxWidth: '500px' }}
            >
              <h3 style={{ marginBottom: '1.5rem' }}>Post an Opportunity</h3>
              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label>Job Title</label>
                  <input type="text" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Senior React Developer" />
                </div>
                <div className="input-group">
                  <label>Company Name</label>
                  <input type="text" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} placeholder="e.g. Google" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Type</label>
                    <select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})}>
                      <option>Full-time</option>
                      <option>Internship</option>
                      <option>Freelance</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Location</label>
                    <input type="text" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. Remote" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Salary/Budget</label>
                  <input type="text" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} placeholder="e.g. $100k - $120k" />
                </div>
                <div className="input-group">
                  <label>Application Link</label>
                  <input type="url" required value={newJob.link} onChange={e => setNewJob({...newJob, link: e.target.value})} placeholder="https://..." />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Post Job</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobBoard;

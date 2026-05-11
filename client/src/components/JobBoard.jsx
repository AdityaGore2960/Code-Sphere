import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Briefcase, MapPin, DollarSign, ExternalLink, Filter, Search,
  PlusCircle, Bookmark, BookmarkCheck, Building2, Clock,
  ChevronRight, X, Layout, CheckCircle2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const JobBoard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'All',
    experienceLevel: 'All',
    remote: 'All'
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    type: 'Full-time',
    location: 'Remote',
    salary: '',
    description: '',
    link: '',
    skills: '',
    experienceLevel: 'Entry Level',
    remote: true,
    logo: ''
  });
  const [hasNewJobs, setHasNewJobs] = useState(false);
  const [newJobCount, setNewJobCount] = useState(0);

  useEffect(() => {
    fetchJobs();
  }, [filters, searchQuery]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_job', (job) => {
      // If we are searching or filtering, don't auto-add to list but show notification
      if (searchQuery || filters.type !== 'All' || filters.experienceLevel !== 'All' || filters.remote !== 'All') {
        setHasNewJobs(true);
        setNewJobCount(prev => prev + 1);
      } else {
        setJobs(prev => [job, ...prev]);
      }
    });

    return () => socket.off('new_job');
  }, [socket, searchQuery, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.type !== 'All') params.append('type', filters.type);
      if (filters.experienceLevel !== 'All') params.append('experienceLevel', filters.experienceLevel);
      if (filters.remote !== 'All') params.append('remote', filters.remote === 'Remote');

      const { data } = await axios.get(`/jobs?${params.toString()}`);
      setJobs(data);
      if (data.length > 0 && !selectedJob) setSelectedJob(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const jobData = {
        ...newJob,
        skills: newJob.skills.split(',').map(s => s.trim()).filter(Boolean),
        logo: newJob.logo || `https://logo.clearbit.com/${newJob.company.toLowerCase().replace(/\s/g, '')}.com`
      };
      await axios.post('/jobs', jobData);
      fetchJobs();
      setShowAddModal(false);
      setNewJob({ title: '', company: '', type: 'Full-time', location: 'Remote', salary: '', description: '', link: '', skills: '', experienceLevel: 'Entry Level', remote: true, logo: '' });
    } catch (err) {
      console.error(err);
      alert('Error creating job');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const { data } = await axios.post(`/jobs/save/${jobId}`);
      setJobs(prev => prev.map(j =>
        j._id === jobId ? { ...j, savedBy: data.isSaved ? [...j.savedBy, user._id] : j.savedBy.filter(id => id !== user._id) } : j
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const JobCard = ({ job }) => (
    <motion.div
      onClick={() => setSelectedJob(job)}
      style={{
        padding: '1rem',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        background: selectedJob?._id === job._id ? 'var(--primary-light)' : 'transparent',
        transition: '0.2s'
      }}
      whileHover={{ background: 'var(--bg)' }}
    >
      <div style={{ display: 'flex', gap: '1rem' }}>
        <img
          src={job.logo || `https://ui-avatars.com/api/?name=${job.company}&background=random`}
          style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }}
          alt={job.company}
        />
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>{job.title}</h4>
          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{job.company}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{job.location} ({job.type})</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
            <Clock size={12} color="var(--text-light)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleSaveJob(job._id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {job.savedBy?.includes(user._id) ? <BookmarkCheck size={20} color="var(--primary)" /> : <Bookmark size={20} color="var(--text-light)" />}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
      {/* Header with Search */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase size={24} color="var(--primary)" /> Developer Opportunities
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <PlusCircle size={18} /> Post a Job
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by title, company or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
          >
            <option value="All">Job Type: All</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>

          <select
            value={filters.remote}
            onChange={(e) => setFilters({ ...filters, remote: e.target.value })}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
          >
            <option value="All">Location: All</option>
            <option value="Remote">Remote Only</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {['React', 'Node.js', 'Python', 'AI', 'Full Stack', 'Backend'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              style={{
                padding: '0.3rem 0.8rem',
                background: searchQuery === tag ? 'var(--primary)' : 'var(--primary-light)',
                color: searchQuery === tag ? 'white' : 'var(--primary)',
                borderRadius: '15px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hasNewJobs && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', textAlign: 'center', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            onClick={() => {
              setFilters({ type: 'All', experienceLevel: 'All', remote: 'All' });
              setSearchQuery('');
              setHasNewJobs(false);
              setNewJobCount(0);
              fetchJobs();
            }}
          >
            {newJobCount} new jobs available. Click to show.
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', height: '600px' }}>
        {/* Left Column: Job List */}
        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>Searching for best roles...</div>
          ) : (
            jobs.map(job => <JobCard key={job._id} job={job} />)
          )}
          {jobs.length === 0 && !loading && (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <Info size={40} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-light)' }}>No jobs found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Right Column: Job Details */}
        <div style={{ overflowY: 'auto', background: '#fff', padding: '2rem' }}>
          {selectedJob ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selectedJob._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <img
                    src={selectedJob.logo || `https://ui-avatars.com/api/?name=${selectedJob.company}&background=random`}
                    style={{ width: '80px', height: '80px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    alt=""
                  />
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedJob.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedJob.company}</span>
                      <span style={{ color: 'var(--text-light)' }}>•</span>
                      <span style={{ color: 'var(--text-light)' }}>{selectedJob.location}</span>
                      <span style={{ color: 'var(--text-light)' }}>•</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{selectedJob.savedBy?.length || 0} saves</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleSaveJob(selectedJob._id)}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {selectedJob.savedBy?.includes(user._id) ? <><BookmarkCheck size={18} /> Saved</> : <><Bookmark size={18} /> Save</>}
                  </button>
                  <a
                    href={selectedJob.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
                  >
                    Apply Now <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--bg)', borderRadius: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Experience level</h4>
                  <p style={{ fontWeight: 600 }}>{selectedJob.experienceLevel}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Salary Range</h4>
                  <p style={{ fontWeight: 600 }}>{selectedJob.salary || 'Competitive'}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Job Type</h4>
                  <p style={{ fontWeight: 600 }}>{selectedJob.type}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Location</h4>
                  <p style={{ fontWeight: 600 }}>{selectedJob.remote ? 'Remote' : selectedJob.location}</p>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>About the Job</h3>
                <p style={{ lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Required Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {selectedJob.skills?.map(skill => (
                    <span key={skill} style={{ padding: '0.5rem 1rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
              <Briefcase size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>Select a job to view details</p>
            </div>
          )}
        </div>
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
              style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Post a New Job</h2>
                <X size={24} onClick={() => setShowAddModal(false)} style={{ cursor: 'pointer' }} />
              </div>

              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="input-group">
                  <label>Job Title</label>
                  <input type="text" required value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Senior Full Stack Engineer" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Company</label>
                    <input type="text" required value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="e.g. Acme Corp" />
                  </div>
                  <div className="input-group">
                    <label>Logo URL (Optional)</label>
                    <input type="text" value={newJob.logo} onChange={e => setNewJob({ ...newJob, logo: e.target.value })} placeholder="https://..." />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Job Type</label>
                    <select value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}>
                      <option>Full-time</option>
                      <option>Internship</option>
                      <option>Freelance</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Experience Level</label>
                    <select value={newJob.experienceLevel} onChange={e => setNewJob({ ...newJob, experienceLevel: e.target.value })}>
                      <option>Entry Level</option>
                      <option>Mid Level</option>
                      <option>Senior Level</option>
                      <option>Lead</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Location</label>
                    <input type="text" required value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} placeholder="e.g. San Francisco or Remote" />
                  </div>
                  <div className="input-group">
                    <label>Salary Range</label>
                    <input type="text" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} placeholder="e.g. ₹15 LPA - ₹25 LPA" />
                  </div>
                </div>

                <div className="input-group">
                  <label>Required Skills (comma separated)</label>
                  <input type="text" value={newJob.skills} onChange={e => setNewJob({ ...newJob, skills: e.target.value })} placeholder="React, Node.js, AWS, etc." />
                </div>

                <div className="input-group">
                  <label>Application Link</label>
                  <input type="url" required value={newJob.link} onChange={e => setNewJob({ ...newJob, link: e.target.value })} placeholder="https://company.com/apply" />
                </div>

                <div className="input-group">
                  <label>Job Description</label>
                  <textarea
                    required
                    value={newJob.description}
                    onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    style={{ minHeight: '150px' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isPosting}>
                    {isPosting ? 'Posting...' : 'Post Opportunity'}
                  </button>
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

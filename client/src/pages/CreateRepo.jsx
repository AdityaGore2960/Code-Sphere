import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Shield, Globe, Lock, Info, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateRepo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'public',
    hasReadme: false,
    license: 'None'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/repos', formData);
      navigate(`/profile/${user.username}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '4rem 2rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary-light)', p: '1rem', borderRadius: '12px' }}>
            <BookOpen size={32} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Create a new repository</h1>
            <p style={{ color: 'var(--text-light)' }}>A repository contains all project files, including the revision history.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
          {/* Owner & Name */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Owner</label>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}`} style={{ width: '20px', height: '20px', borderRadius: '50%' }} alt="" />
                {user.username}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--border)' }}>/</span>
            <div style={{ flex: 2 }}>
              <label htmlFor="repo-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Repository name *</label>
              <input 
                type="text" 
                id="repo-name"
                name="name"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="my-awesome-project"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}
              />
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
            Great repository names are short and memorable. Need inspiration? How about <span style={{ color: 'var(--primary)', fontWeight: 600 }}>solid-guacamole</span>?
          </p>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(optional)</span></label>
            <input 
              type="text" 
              id="description"
              name="description"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="A brief description of your project"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '2rem 0' }}></div>

          {/* Visibility */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div 
              className={`visibility-option ${formData.visibility === 'public' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, visibility: 'public'})}
              style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '10px', cursor: 'pointer', border: formData.visibility === 'public' ? '2px solid var(--primary)' : '1px solid var(--border)', background: formData.visibility === 'public' ? 'var(--primary-light)' : 'transparent', marginBottom: '1rem', transition: 'all 0.2s' }}
            >
              <Globe size={24} color={formData.visibility === 'public' ? 'var(--primary)' : 'var(--text-light)'} style={{ marginTop: '0.2rem' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Public</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: 0 }}>Anyone on the internet can see this repository. You choose who can commit.</p>
              </div>
              {formData.visibility === 'public' && <Check size={20} color="var(--primary)" style={{ marginLeft: 'auto' }} />}
            </div>

            <div 
              className={`visibility-option ${formData.visibility === 'private' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, visibility: 'private'})}
              style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '10px', cursor: 'pointer', border: formData.visibility === 'private' ? '2px solid var(--primary)' : '1px solid var(--border)', background: formData.visibility === 'private' ? 'var(--primary-light)' : 'transparent', transition: 'all 0.2s' }}
            >
              <Lock size={24} color={formData.visibility === 'private' ? 'var(--primary)' : 'var(--text-light)'} style={{ marginTop: '0.2rem' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Private</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: 0 }}>You choose who can see and commit to this repository.</p>
              </div>
              {formData.visibility === 'private' && <Check size={20} color="var(--primary)" style={{ marginLeft: 'auto' }} />}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '2rem 0' }}></div>

          {/* Additional Settings */}
          <h4 style={{ marginBottom: '1.5rem' }}>Initialize this repository with:</h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '0.5rem 0' }}>
            <input 
              type="checkbox" 
              id="readme"
              checked={formData.hasReadme}
              onChange={e => setFormData({...formData, hasReadme: e.target.checked})}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="readme" style={{ cursor: 'pointer' }}>
              <strong style={{ display: 'block' }}>Add a README file</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>This is where you can write a long description for your project.</span>
            </label>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label htmlFor="license" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Choose a license</label>
            <select 
              id="license"
              name="license"
              value={formData.license}
              onChange={e => setFormData({...formData, license: e.target.value})}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer' }}
            >
              <option value="None">None</option>
              <option value="MIT">MIT License</option>
              <option value="Apache-2.0">Apache License 2.0</option>
              <option value="GPL-3.0">GNU GPLv3</option>
            </select>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
              A license tells others what they can and can't do with your code.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '2.5rem 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              {loading ? 'Creating...' : 'Create repository'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateRepo;

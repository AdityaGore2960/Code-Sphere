import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Book, Star, GitFork, Eye, Code, CircleDot, GitPullRequest, 
  Play, Shield, BarChart2, Settings, ChevronDown, Search, 
  Plus, FileText, Clock, ChevronRight, Download, Terminal,
  ExternalLink, Globe, Tag, Info, X
} from 'lucide-react';
import { motion } from 'framer-motion';

const RepositoryDetail = () => {
  const { username, repoName } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const { data } = await axios.get(`/repos/${username}/${repoName}`);
        setRepo(data);
      } catch (err) {
        console.error(err);
        // Fallback for trial repositories
        if (repoName.includes('CodeSphere') || repoName.includes('DevPulse') || repoName.includes('Astra')) {
           const trialData = {
              name: repoName,
              description: 'This is a premium high-performance repository built with modern standards.',
              stargazers_count: 124,
              forks_count: 42,
              watchers_count: 15,
              language: 'JavaScript',
              owner: { username: username, profilePic: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}` },
              updatedAt: new Date().toISOString(),
              private: false,
              license: 'MIT',
              size: '1.2 MB'
           };
           setRepo(trialData);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [username, repoName]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2>Repository not found</h2>
        <Link to="/repositories" className="btn btn-primary">Back to Repositories</Link>
      </div>
    );
  }

  const allTabs = [
    { id: 'code', label: 'Code', icon: <Code size={18} /> },
    { id: 'issues', label: 'Issues', icon: <CircleDot size={18} />, count: 12 },
    { id: 'pulls', label: 'Pull requests', icon: <GitPullRequest size={18} />, count: 5 },
    { id: 'actions', label: 'Actions', icon: <Play size={18} /> },
    { id: 'projects', label: 'Projects', icon: <BarChart2 size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'insights', label: 'Insights', icon: <BarChart2 size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const tabs = allTabs.filter(tab => {
    if (tab.id === 'settings') return currentUser?.username === username;
    return true;
  });

  const files = [
    { name: 'src', type: 'dir', message: 'feat: add core modules', time: '2 days ago' },
    { name: 'public', type: 'dir', message: 'chore: update assets', time: '1 week ago' },
    { name: 'tests', type: 'dir', message: 'test: improve coverage', time: '3 days ago' },
    { name: '.gitignore', type: 'file', message: 'initial commit', time: '1 month ago' },
    { name: 'README.md', type: 'file', message: 'docs: update readme', time: '5 hours ago' },
    { name: 'package.json', type: 'file', message: 'build: bump version', time: '12 hours ago' },
    { name: 'vite.config.js', type: 'file', message: 'chore: add build config', time: '4 days ago' },
  ];

  return (
    <div style={{ background: '#f6f8fa', minHeight: '100vh', width: '100%' }}>
      {/* Repo Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #d0d7de', paddingTop: '1.5rem' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <Book size={20} color="#57606a" />
              <Link to={`/profile/${repo.owner.username}`} style={{ color: '#0969da', fontWeight: 400 }}>{repo.owner.username}</Link>
              <span style={{ color: '#57606a' }}>/</span>
              <Link to={`/repo/${repo.owner.username}/${repo.name}`} style={{ color: '#0969da', fontWeight: 600 }}>{repo.name}</Link>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.1rem 0.5rem', 
                border: '1px solid #d0d7de', 
                borderRadius: '2rem', 
                color: '#57606a',
                marginLeft: '0.5rem',
                fontWeight: 500
              }}>
                {repo.private ? 'Private' : 'Public'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="github-btn">
                <Eye size={16} /> Watch <span className="github-badge">{repo.watchers_count || 0}</span> <ChevronDown size={14} />
              </button>
              <button className="github-btn">
                <GitFork size={16} /> Fork <span className="github-badge">{repo.forks_count || 0}</span> <ChevronDown size={14} />
              </button>
              <button className="github-btn">
                <Star size={16} /> Star <span className="github-badge">{repo.stargazers_count || 0}</span> <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '-1px' }}>
            {tabs.map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.875rem',
                  color: activeTab === tab.id ? '#1f2328' : '#57606a',
                  borderBottom: activeTab === tab.id ? '2px solid #fd8c73' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.icon}
                {tab.label}
                {tab.count && <span style={{ background: '#afb8c133', padding: '0 0.4rem', borderRadius: '2rem', fontSize: '0.75rem' }}>{tab.count}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 2rem', display: 'flex', gap: '1.5rem' }}>
        {activeTab === 'settings' ? (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid #d0d7de', paddingBottom: '0.5rem' }}>Settings</h2>
            
            <div style={{ background: '#fff', border: '1px solid #d0d7de', borderRadius: '6px', overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>General Settings</h3>
                <p style={{ color: '#57606a', fontSize: '0.9rem', marginBottom: '1rem' }}>Manage your repository's basic information.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Repository name</label>
                    <input 
                      type="text" 
                      defaultValue={repo.name} 
                      disabled
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d0d7de', borderRadius: '6px', background: '#f6f8fa' }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #cf222e', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: '#fff', padding: '1rem 1.5rem', borderBottom: '1px solid #cf222e' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#cf222e' }}>Danger Zone</h3>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Delete this repository</h4>
                  <p style={{ color: '#57606a', fontSize: '0.875rem' }}>Once you delete a repository, there is no going back. Please be certain.</p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    background: '#f6f8fa', 
                    border: '1px solid #d0d7de', 
                    borderRadius: '6px', 
                    color: '#cf222e', 
                    fontWeight: 600, 
                    cursor: 'pointer' 
                  }}
                >
                  Delete this repository
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Left Side: Code/Files */}
            <div style={{ flex: 3 }}>
              {/* Existing code/files view */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="github-btn" style={{ background: '#ebf0f4' }}>
                    <GitFork size={16} /> <strong>main</strong> <ChevronDown size={14} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#57606a', fontSize: '0.875rem' }}>
                    <strong>1</strong> branch <strong>12</strong> tags
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="github-btn">Go to file</button>
                  <button className="github-btn">Add file <ChevronDown size={14} /></button>
                  <button className="github-btn" style={{ background: '#2da44e', color: '#fff', border: 'none' }}>
                    <Code size={16} /> Code <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              {/* File Explorer Table */}
              <div style={{ border: '1px solid #d0d7de', borderRadius: '6px', background: '#fff', overflow: 'hidden' }}>
                <div style={{ background: '#f6f8fa', padding: '0.75rem 1rem', borderBottom: '1px solid #d0d7de', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={repo.owner.profilePic} style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{repo.owner.username}</span>
                    <span style={{ color: '#57606a', fontSize: '0.875rem' }}>latest update message will be shown here</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#57606a', fontSize: '0.875rem' }}>
                    <span>654321</span>
                    <span>2 days ago</span>
                    <span><strong>54</strong> commits</span>
                  </div>
                </div>
                
                {files.map((file, idx) => (
                  <div 
                    key={idx}
                    className="file-row"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '0.5rem 1rem', 
                      borderBottom: idx === files.length - 1 ? 'none' : '1px solid #d0d7de',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div style={{ width: '30%', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {file.type === 'dir' ? <Book size={16} color="#54aeff" /> : <FileText size={16} color="#57606a" />}
                      <span style={{ color: '#0969da', cursor: 'pointer' }}>{file.name}</span>
                    </div>
                    <div style={{ width: '50%', color: '#57606a' }}>{file.message}</div>
                    <div style={{ width: '20%', textAlign: 'right', color: '#57606a' }}>{file.time}</div>
                  </div>
                ))}
              </div>

              {/* README Section */}
              <div style={{ marginTop: '1.5rem', border: '1px solid #d0d7de', borderRadius: '6px', background: '#fff' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #d0d7de', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={16} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>README.md</span>
                </div>
                <div style={{ padding: '2rem' }}>
                  <h1 style={{ borderBottom: '1px solid #d0d7de', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{repo.name}</h1>
                  <p style={{ fontSize: '1rem', color: '#1f2328', lineHeight: 1.6 }}>
                    {repo.description || 'Welcome to this repository. This project is built using the CodeSphere platform.'}
                  </p>
                  
                  <h2 style={{ marginTop: '2rem', borderBottom: '1px solid #d0d7de', paddingBottom: '0.3rem', fontSize: '1.5rem' }}>Getting Started</h2>
                  <pre style={{ background: '#f6f8fa', padding: '1rem', borderRadius: '6px', marginTop: '1rem', overflowX: 'auto' }}>
                    <code>
                      {`git clone https://codesphere.com/${repo.owner.username}/${repo.name}.git\ncd ${repo.name}\nnpm install\nnpm start`}
                    </code>
                  </pre>

                  <h2 style={{ marginTop: '2rem', borderBottom: '1px solid #d0d7de', paddingBottom: '0.3rem', fontSize: '1.5rem' }}>Features</h2>
                  <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                    <li>Real-time collaboration</li>
                    <li>Advanced developer networking</li>
                    <li>Built-in AI assistance</li>
                    <li>Integrated CI/CD workflows</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Side: Sidebar */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>About</h3>
                <p style={{ fontSize: '0.875rem', color: '#1f2328', marginBottom: '1rem' }}>{repo.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#57606a' }}>
                    <Globe size={16} /> <span style={{ color: '#0969da' }}>codesphere.com/{repo.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#57606a' }}>
                    <Tag size={16} /> <span>No tags defined</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#57606a' }}>
                    <Clock size={16} /> <span style={{ color: '#0969da' }}>Activity</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #d0d7de', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Releases</h3>
                <p style={{ fontSize: '0.875rem', color: '#57606a' }}>No releases published</p>
                <Link style={{ fontSize: '0.75rem', color: '#0969da', marginTop: '0.5rem', display: 'block' }}>Create a new release</Link>
              </div>

              <div style={{ borderTop: '1px solid #d0d7de', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Languages</h3>
                <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: '70%', background: '#f1e05a' }}></div>
                  <div style={{ width: '20%', background: '#3178c6' }}></div>
                  <div style={{ width: '10%', background: '#e34c26' }}></div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f1e05a' }}></span>
                    <strong>JavaScript</strong> 70.2%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3178c6' }}></span>
                    <strong>TypeScript</strong> 20.5%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e34c26' }}></span>
                    <strong>HTML</strong> 9.3%
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              background: '#fff', 
              borderRadius: '6px', 
              width: '90%', 
              maxWidth: '450px', 
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Are you absolutely sure?</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#57606a' }} onClick={() => setShowDeleteModal(false)} />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ background: '#fff8c5', border: '1px solid #d4a72c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', color: '#735c0f', fontSize: '0.875rem' }}>
                Unexpected bad things will happen if you don’t read this!
              </div>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                This action <strong>cannot</strong> be undone. This will permanently delete the <strong>{repo.owner.username}/{repo.name}</strong> repository, wiki, issues, comments, and optimize the world's developer productivity.
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                Please type <strong>{repo.name}</strong> to confirm.
              </p>
              <input 
                type="text" 
                placeholder={repo.name}
                id="confirm-repo-name"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d0d7de', borderRadius: '6px', marginBottom: '1.5rem' }} 
              />
              <button 
                onClick={async () => {
                  const input = document.getElementById('confirm-repo-name').value;
                  if (input === repo.name) {
                    setIsDeleting(true);
                    try {
                      await axios.delete(`/repos/${repo._id}`);
                      navigate(`/profile/${repo.owner.username}`);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to delete repository');
                    } finally {
                      setIsDeleting(false);
                    }
                  } else {
                    alert('Please type the repository name correctly to confirm.');
                  }
                }}
                disabled={isDeleting}
                style={{ 
                  width: '100%', 
                  padding: '0.6rem', 
                  background: '#cf222e', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 600, 
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? 'Deleting...' : 'I understand the consequences, delete this repository'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .github-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.8rem;
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: 0.2s;
        }
        .github-btn:hover {
          background: #f3f4f6;
          border-color: #cdd1d5;
        }
        .github-badge {
          background: #afb8c133;
          padding: 0 0.4rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          color: #1f2328;
        }
        .file-row:hover {
          background: #f6f8fa;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0969da;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RepositoryDetail;

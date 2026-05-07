import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link as LinkIcon, MapPin, Calendar, Edit3, UserPlus, UserMinus, Star, GitFork, Code, BookOpen, Layers, Heart, Search, Camera, Upload, Image, X } from 'lucide-react';
import PostCard from '../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { username } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';
  
  const { user: currentUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [localRepos, setLocalRepos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempImagePreview, setTempImagePreview] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);
  const [repoSearch, setRepoSearch] = useState('');
  const [repoType, setRepoType] = useState('all');
  const [repoLanguage, setRepoLanguage] = useState('all');
  const [repoSort, setRepoSort] = useState('updated');
  const [loading, setLoading] = useState(true);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowPhotoMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        // Clean profile data to avoid sending populated objects
        const cleanProfile = { ...profile };
        delete cleanProfile.followers;
        delete cleanProfile.following;
        
        await updateProfile({ ...cleanProfile, profilePic: base64String });
        setProfile({ ...profile, profilePic: base64String });
        setShowPhotoMenu(false);
        alert('Profile picture updated successfully!');
      } catch (err) {
        console.error('Failed to update profile picture:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        alert(`Failed to update profile picture: ${errorMsg}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`/users/profile/${username}`);
      setProfile(data);
      setEditData(data);
      setIsFollowing(data.followers.some(f => f._id === currentUser._id));
      
      const githubRes = await axios.get(`/users/github/${data.githubUsername || username}`);
      setRepos(githubRes.data);
      
      const localRes = await axios.get(`/repos/${username}`);
      setLocalRepos(localRes.data);
      
      const postRes = await axios.get('/posts/explore');
      setPosts(postRes.data.filter(p => p.user.username === username));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    try {
      await axios.post(`/users/follow/${profile._id}`);
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    console.log('Updating profile with data:', editData);
    
    try {
      const formData = new FormData();
      formData.append('name', editData.name || '');
      formData.append('bio', editData.bio || '');
      formData.append('pronouns', editData.pronouns || '');
      formData.append('githubUsername', editData.githubUsername || '');
      
      if (editData.socialLinks) {
        formData.append('socialLinks', JSON.stringify(editData.socialLinks));
      }
      
      if (tempImageFile) {
        formData.append('profilePic', tempImageFile);
      }

      const updatedData = await updateProfile(formData);
      console.log('Profile updated successfully:', updatedData);
      setProfile(updatedData);
      setIsEditing(false);
      setTempImageFile(null);
      setTempImagePreview('');
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to update profile: ${errorMsg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  if (!profile) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10rem' }}><p className="fade-in">Loading profile...</p></div>;

  const projects = posts.filter(p => p.isProject);
  const likedPosts = posts.filter(p => p.likes?.includes(profile._id));
  
  // Trial repositories for demonstration
  const allRepos = [...repos, ...localRepos];
  
  // Filtering and Sorting Logic
  const languages = ['all', ...new Set(allRepos.map(r => r.language).filter(Boolean))];
  
  const filteredRepos = allRepos
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(repoSearch.toLowerCase());
      const matchesLanguage = repoLanguage === 'all' || repo.language === repoLanguage;
      const matchesType = repoType === 'all' || (repoType === 'public' && !repo.private) || (repoType === 'private' && repo.private);
      return matchesSearch && matchesLanguage && matchesType;
    })
    .sort((a, b) => {
      if (repoSort === 'updated') {
        const dateA = new Date(a.updatedAt || a.updated_at || 0);
        const dateB = new Date(b.updatedAt || b.updated_at || 0);
        return dateB - dateA;
      }
      if (repoSort === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (repoSort === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

  const starredRepos = [...allRepos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
  const popularPosts = [...posts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

  const starItems = [
    ...starredRepos.map(r => ({ ...r, type: 'repo' })),
    ...likedPosts.map(p => ({ ...p, type: 'post' }))
  ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // contribution data could be fetched here
  const contributionData = []; 

  const renderSection = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {/* Popular Posts */}
                <section>
                  <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={20} color="var(--primary)" /> Popular Posts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {popularPosts.length > 0 ? popularPosts.map(post => (
                      <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
                    )) : <p>No posts yet.</p>}
                  </div>
                </section>

                {/* Contribution Graph */}
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Layers size={20} /> Contributions</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Last 15 days</span>
                  </div>
                  <div className="card contribution-container">
                    <div className="bar-graph">
                      {contributionData.map((data, i) => (
                        <div 
                          key={i} 
                          className="bar-item" 
                          style={{ height: `${(data.value / 15) * 100}%` }}
                          data-value={data.value}
                        ></div>
                      ))}
                    </div>
                    {contributionData.length > 0 && (
                      <div className="graph-labels">
                        <span>{contributionData[0].label}</span>
                        <span>{contributionData[Math.floor(contributionData.length / 2)].label}</span>
                        <span>Today</span>
                      </div>
                    )}
                  </div>
                </section>
                
                {/* Recent Activity */}
                <section>
                  <h3 style={{ marginBottom: '1.25rem' }}>Recent Activity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {posts.length > 0 ? posts.slice(0, 3).map(post => (
                      <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
                    )) : <p>No activity yet.</p>}
                  </div>
                </section>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card">
                  <h4 style={{ marginBottom: '1.25rem' }}>Tech Stack</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {(profile.skills && profile.skills.length > 0) ? profile.skills.map(skill => (
                      <span key={skill} className="tag">{skill}</span>
                    )) : ['JavaScript', 'React', 'NodeJS', 'Python', 'Tailwind'].map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                
                <div className="card">
                  <h4 style={{ marginBottom: '1.25rem' }}>Platform Stats</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Layers size={16} /> Repos</span>
                      <strong style={{ fontSize: '1.1rem' }}>{allRepos.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code size={16} /> Showcase</span>
                      <strong style={{ fontSize: '1.1rem' }}>{projects.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Heart size={16} /> Followers</span>
                      <strong style={{ fontSize: '1.1rem' }}>{profile.followers?.length || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'repositories':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Filter Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', background: '#fff' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  placeholder="Find a repository..." 
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}
                />
              </div>
              
              <select 
                value={repoType} 
                onChange={(e) => setRepoType(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer' }}
              >
                <option value="all">Type: All</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <select 
                value={repoLanguage} 
                onChange={(e) => setRepoLanguage(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', textTransform: 'capitalize' }}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang === 'all' ? 'Language: All' : lang}</option>
                ))}
              </select>

              <select 
                value={repoSort} 
                onChange={(e) => setRepoSort(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer' }}
              >
                <option value="updated">Sort: Last Updated</option>
                <option value="stars">Sort: Stars</option>
                <option value="alphabetical">Sort: Name</option>
              </select>

              {currentUser.username === username && (
                <button 
                  className="btn btn-primary" 
                  style={{ marginLeft: 'auto' }}
                  onClick={() => navigate('/create-repo')}
                >
                  <BookOpen size={18} /> New
                </button>
              )}
            </div>

            {/* Repos Grid */}
            <div className="repo-grid">
              {filteredRepos.length > 0 ? filteredRepos.map(repo => (
                <a href={repo.html_url} target="_blank" rel="noreferrer" key={repo.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', transition: 'var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{repo.name}</h4>
                    <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg)', color: 'var(--text-light)', border: '1px solid var(--border)' }}>
                      {repo.private ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>{repo.description || 'No description provided'}</p>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={16} color="#eab308" /> {repo.stargazers_count}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><GitFork size={16} /> {repo.forks_count}</span>
                    {repo.language && (
                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                        {repo.language}
                      </span>
                    )}
                  </div>
                </a>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 0' }}>
                  <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>No repositories found matching your filters.</p>
                  <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => { setRepoSearch(''); setRepoType('all'); setRepoLanguage('all'); }}>Clear Filters</button>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'projects':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {currentUser.username === username && (
              <div className="card" style={{ 
                border: '2px dashed var(--border)', 
                background: 'var(--primary-light)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '3rem', 
                textAlign: 'center',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#e0eaff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
              onClick={() => navigate('/')}
              >
                <div style={{ background: 'white', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}>
                  <Code size={40} color="var(--primary)" />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>Create Your First CodeSphere Project</h3>
                <p style={{ color: 'var(--text-light)', maxWidth: '400px', marginBottom: '1.5rem' }}>Showcase your best work to the community. Add tech stacks, GitHub repos, and live demos.</p>
                <button className="btn btn-primary">
                  <Code size={18} /> Get Started
                </button>
              </div>
            )}
            {projects.length > 0 ? projects.map(project => (
              <PostCard key={project._id} post={project} onDelete={handleDeletePost} />
            )) : currentUser.username !== username && <p style={{ textAlign: 'center', padding: '3rem' }}>No showcase projects yet.</p>}
          </motion.div>
        );
      case 'stars':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {starredRepos.map(repo => (
                  <a href={repo.html_url} target="_blank" rel="noreferrer" key={repo.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{repo.name}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem', flex: 1 }}>{repo.description || 'No description provided'}</p>
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={16} color="#eab308" fill="#eab308" /> {repo.stargazers_count}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><GitFork size={16} /> {repo.forks_count}</span>
                      {repo.language && <span className="tag" style={{ marginLeft: 'auto' }}>{repo.language}</span>}
                    </div>
                  </a>
                ))}
              </div>
              
              {likedPosts.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Heart size={20} color="#ef4444" fill="#ef4444" /> Liked Posts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {likedPosts.map(post => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', height: '180px', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>
        </div>
        <div style={{ padding: '0 2.5rem 2rem', marginTop: '-70px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ position: 'relative', cursor: currentUser.username === username ? 'pointer' : 'default' }}
                onClick={() => currentUser.username === username && setShowPhotoMenu(!showPhotoMenu)}
              >
                <img 
                  src={profile.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                  alt={profile.username} 
                  style={{ width: '140px', height: '140px', borderRadius: '30px', border: '6px solid var(--card-bg)', background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)', objectFit: 'cover' }} 
                />
                {currentUser.username === username && (
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '30px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    opacity: 0, 
                    transition: 'opacity 0.2s',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                  >
                    <Camera size={24} />
                  </div>
                )}
              </motion.div>

              {/* Hidden Inputs */}
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              <input 
                type="file" 
                ref={cameraInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                capture="user" 
                onChange={handleImageChange} 
              />

              {/* Photo Menu */}
              <AnimatePresence>
                {showPhotoMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      marginTop: '0.5rem', 
                      background: 'white', 
                      border: '1px solid var(--border)', 
                      borderRadius: '12px', 
                      boxShadow: 'var(--shadow-lg)', 
                      zIndex: 100, 
                      minWidth: '180px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: '0.5rem' }}>
                      <button 
                        onClick={() => cameraInputRef.current.click()}
                        style={{ 
                          width: '100%', 
                          padding: '0.75rem 1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          borderRadius: '8px',
                          color: 'var(--text)',
                          fontSize: '0.9rem'
                        }}
                        className="menu-item-hover"
                      >
                        <Camera size={18} color="var(--primary)" />
                        Upload (Camera)
                      </button>
                      <button 
                        onClick={() => fileInputRef.current.click()}
                        style={{ 
                          width: '100%', 
                          padding: '0.75rem 1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          borderRadius: '8px',
                          color: 'var(--text)',
                          fontSize: '0.9rem'
                        }}
                        className="menu-item-hover"
                      >
                        <Image size={18} color="var(--primary)" />
                        Browse (Gallery)
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {currentUser.username === username ? (
                <button 
                  className="btn btn-outline" 
                  style={{ background: 'white' }} 
                  onClick={() => {
                    setEditData(profile);
                    setIsEditing(true);
                  }}
                >
                  <Edit3 size={18} /> Edit Profile
                </button>
              ) : (
                <button className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} style={isFollowing ? {background: 'white'} : {}} onClick={handleFollow}>
                  {isFollowing ? <><UserMinus size={18} /> Unfollow</> : <><UserPlus size={18} /> Follow</>}
                </button>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{profile.name || profile.username}</h1>
              {profile.pronouns && <span style={{ color: 'var(--text-light)', fontSize: '1rem', marginTop: '0.5rem' }}>({profile.pronouns})</span>}
              <span className="badge badge-project" style={{ marginTop: '0.5rem' }}>Dev</span>
            </div>
            {profile.name && <p style={{ color: 'var(--text-light)', fontSize: '1rem', fontWeight: 600 }}>@{profile.username}</p>}
            <p style={{ color: 'var(--text-light)', fontSize: '1.15rem', marginTop: '0.25rem' }}>{profile.bio || 'New developer on CodeSphere'}</p>
            
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                <Calendar size={18} /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
              {profile.githubUsername && (
                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <LinkIcon size={18} /> github.com/{profile.githubUsername}
                </a>
              )}
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text)' }}>
                <span><strong>{profile.followers?.length || 0}</strong> <span style={{color: 'var(--text-light)'}}>followers</span></span>
                <span><strong>{profile.following?.length || 0}</strong> <span style={{color: 'var(--text-light)'}}>following</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: <BookOpen size={18} /> },
          { id: 'repositories', label: 'Repositories', icon: <Layers size={18} />, count: allRepos.length },
          { id: 'projects', label: 'Projects', icon: <Code size={18} />, count: projects.length },
          { id: 'stars', label: 'Stars', icon: <Star size={18} /> }
        ].map(tab => (
          <div 
            key={tab.id} 
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
          </div>
        ))}
      </div>

      {/* Section Content */}
      <div style={{ padding: '0 1rem' }}>
        {renderSection()}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card" 
              style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h2 style={{ marginBottom: '1.5rem' }}>Edit Profile</h2>
              <form onSubmit={handleUpdate}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <img 
                      src={tempImagePreview || editData.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                      style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} 
                      alt="Preview" 
                    />
                    <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
                      <Camera size={16} />
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setTempImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setTempImagePreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>Change Profile Picture</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      id="profile-name"
                      name="name"
                      value={editData.name || ''} 
                      onChange={e => setEditData({...editData, name: e.target.value})} 
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="input-group">
                    <label>Pronouns</label>
                    <input 
                      type="text" 
                      id="profile-pronouns"
                      name="pronouns"
                      value={editData.pronouns || ''} 
                      onChange={e => setEditData({...editData, pronouns: e.target.value})} 
                      placeholder="e.g. they/them"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Bio</label>
                  <textarea 
                    id="profile-bio"
                    name="bio"
                    value={editData.bio || ''} 
                    onChange={e => setEditData({...editData, bio: e.target.value})} 
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <h4 style={{ marginBottom: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>Social Accounts</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>GitHub Username</label>
                    <input 
                      type="text" 
                      id="profile-github"
                      name="githubUsername"
                      value={editData.githubUsername || ''} 
                      onChange={e => setEditData({...editData, githubUsername: e.target.value})} 
                      placeholder="your-github-username"
                    />
                  </div>
                  <div className="input-group">
                    <label>LinkedIn</label>
                    <input 
                      type="text" 
                      value={editData.socialLinks?.linkedin || ''} 
                      onChange={e => setEditData({...editData, socialLinks: { ...editData.socialLinks, linkedin: e.target.value }})} 
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="input-group">
                    <label>Twitter</label>
                    <input 
                      type="text" 
                      value={editData.socialLinks?.twitter || ''} 
                      onChange={e => setEditData({...editData, socialLinks: { ...editData.socialLinks, twitter: e.target.value }})} 
                      placeholder="Twitter URL"
                    />
                  </div>
                  <div className="input-group">
                    <label>Portfolio</label>
                    <input 
                      type="text" 
                      value={editData.socialLinks?.portfolio || ''} 
                      onChange={e => setEditData({...editData, socialLinks: { ...editData.socialLinks, portfolio: e.target.value }})} 
                      placeholder="Portfolio URL"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => { setIsEditing(false); setTempImageFile(null); setTempImagePreview(''); }} disabled={isUpdating}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
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

export default Profile;

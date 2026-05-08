import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Image, Video, Calendar, Newspaper, Search, UserPlus, Info, MoreHorizontal, Smile, Share2, MessageCircle, Heart, Book, X, ChevronDown, Users, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import CodingChallenge from '../components/CodingChallenge';
import Leaderboard from '../components/Leaderboard';
import JobBoard from '../components/JobBoard';
import LivePresence from '../components/LivePresence';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRepos, setUserRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [event, setEvent] = useState({ title: '', date: '' });
  const [attachmentType, setAttachmentType] = useState(null); // 'image', 'video', 'event', 'repo'
  const [isRepoSelectorOpen, setIsRepoSelectorOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [techStack, setTechStack] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('/posts');
      setPosts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserRepos = async () => {
    try {
      const { data } = await axios.get(`/repos/${user.username}`);
      setUserRepos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.get('/users/search?q=');
      // Set following status for each suggestion
      const usersWithFollowingStatus = data
        .filter(u => u._id !== user._id)
        .slice(0, 3)
        .map(u => ({
          ...u,
          isFollowing: user.following?.includes(u._id)
        }));
      setSuggestedUsers(usersWithFollowingStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowSuggestion = async (userId) => {
    try {
      await axios.post(`/users/follow/${userId}`);
      setSuggestedUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, isFollowing: !u.isFollowing } : u
      ));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUserRepos();
    fetchSuggestions();
  }, []);

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files].slice(0, 5));
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result].slice(0, 5));
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();

    if (
      !content.trim() &&
      !selectedRepo &&
      imageFiles.length === 0 &&
      !videoFile &&
      !event.title
    ) return;

    try {
      setIsPosting(true);
      const formData = new FormData();
      formData.append('content', content);

      if (selectedRepo && selectedRepo._id) {
        formData.append('repository', selectedRepo._id);
        formData.append('isProject', 'true');
      }

      if (imageFiles.length > 0) {
        if (imageFiles.length === 1) {
          formData.append('image', imageFiles[0]);
        }
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      if (videoFile) {
        formData.append('video', videoFile);
      }

      if (event.title) {
        formData.append('event', JSON.stringify(event));
      }

      if (attachmentType === 'project') {
        formData.append('isProject', 'true');
        formData.append('githubLink', githubLink);
        formData.append('demoLink', demoLink);
        formData.append('techStack', JSON.stringify(techStack.split(',').map(s => s.trim()).filter(Boolean)));
      }

      const { data } = await axios.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPosts([data, ...posts]);

      setContent('');
      setSelectedRepo(null);
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview('');
      setEvent({ title: '', date: '' });
      setAttachmentType(null);
      setGithubLink('');
      setDemoLink('');
      setTechStack('');
      setIsPostModalOpen(false);

    } catch (err) {
      console.error(err);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '225px 1fr 300px', gap: '1.5rem', padding: '1.5rem 0' }}>

      {/* Left Sidebar: Profile Card */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ height: '60px', background: 'var(--primary)', opacity: 0.8 }}></div>
          <div style={{ textAlign: 'center', marginTop: '-35px', padding: '1rem' }}>
            <Link to={`/profile/${user.username}`}>
              <img
                src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                crossOrigin="anonymous"
                style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid white', background: 'white' }}
                alt=""
              />
            </Link>
            <h3 style={{ marginTop: '0.75rem', fontSize: '1rem', fontWeight: 700 }}>{user.username}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{user.bio || 'Developer @ CodeSphere'}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Who's viewed your profile</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>142</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Impressions of your post</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>1,840</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', border: '1px solid var(--border)' }}>
          <p style={{ marginBottom: '0.5rem', cursor: 'pointer' }}>Groups</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span>Events</span>
            <div style={{ width: '14px', height: '14px', border: '1px solid var(--text-light)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
          </div>
          <p style={{ marginTop: '0.5rem', cursor: 'pointer' }}>Followed Hashtags</p>
        </div>

        <JobBoard />
      </aside>

      {/* Main Column: Feed */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Start a Post Box */}
        <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <img
              src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              crossOrigin="anonymous"
              style={{ width: '48px', height: '48px', borderRadius: '50%' }}
              alt=""
            />
            <button
              onClick={() => setIsPostModalOpen(true)}
              style={{ flex: 1, textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '35px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-light)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Start a post
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0.5rem 0' }}>
            <button onClick={() => { setIsPostModalOpen(true); setAttachmentType('image'); }} className="post-tool-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              <Image size={20} color="#378fe9" /> <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>Photo</span>
            </button>
            <button onClick={() => { setIsPostModalOpen(true); setAttachmentType('video'); }} className="post-tool-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              <Video size={20} color="#5f9b41" /> <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>Video</span>
            </button>
            <button onClick={() => { setIsPostModalOpen(true); setAttachmentType('event'); }} className="post-tool-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              <Calendar size={20} color="#c37d16" /> <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>Event</span>
            </button>
            <button onClick={() => { setIsPostModalOpen(true); setAttachmentType('repo'); }} className="post-tool-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              <Book size={20} color="#c37d16" /> <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>Repository</span>
            </button>
            <button onClick={() => { setIsPostModalOpen(true); setAttachmentType('project'); }} className="post-tool-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              <Layout size={20} color="#9333ea" /> <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>Showcase</span>
            </button>
          </div>
        </div>

        {/* LinkedIn Inspired Post Modal */}
        <AnimatePresence>
          {isPostModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '550px', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create a post</h2>
                  <button onClick={() => { setIsPostModalOpen(false); setAttachmentType(null); }} style={{ padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }} className="hover-bg">
                    <X size={24} color="var(--text-light)" />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <img
                      src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                      crossOrigin="anonymous"
                      style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                      alt=""
                    />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{user.username}</h4>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '2px 8px', borderRadius: '15px', border: '1px solid var(--text-light)', background: 'transparent', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, marginTop: '2px' }}>
                        <Users size={14} /> Anyone <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    autoFocus
                    id="post-content"
                    name="content"
                    placeholder="What do you want to talk about?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ width: '100%', minHeight: '120px', border: 'none', background: 'transparent', fontSize: '1.1rem', resize: 'none', outline: 'none', color: 'var(--text)' }}
                  ></textarea>

                  {/* Attachment Inputs */}
                  <AnimatePresence>
                    {attachmentType === 'image' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="input-group">
                        <label htmlFor="post-image-files">Upload Images (Max 5)</label>
                        <input type="file" id="post-image-files" name="imageFiles" accept="image/*" multiple onChange={handleImageFilesChange} />
                      </motion.div>
                    )}
                    {attachmentType === 'video' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="input-group">
                        <label htmlFor="post-video-file">Upload Video</label>
                        <input type="file" id="post-video-file" name="videoFile" accept="video/*" onChange={handleVideoFileChange} />
                      </motion.div>
                    )}
                    {attachmentType === 'event' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="input-group">
                          <label htmlFor="post-event-title">Event Title</label>
                          <input type="text" id="post-event-title" name="eventTitle" value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} placeholder="Hackathon 2026" />
                        </div>
                        <div className="input-group">
                          <label htmlFor="post-event-date">Date</label>
                          <input type="date" id="post-event-date" name="eventDate" value={event.date} onChange={(e) => setEvent({ ...event, date: e.target.value })} />
                        </div>
                      </motion.div>
                    )}
                    {attachmentType === 'repo' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem' }}>
                        {userRepos.map(repo => (
                          <div
                            key={repo._id}
                            onClick={() => { setSelectedRepo(repo); setAttachmentType(null); }}
                            style={{ padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}
                          >
                            <span style={{ fontWeight: 600 }}>{repo.name}</span>
                            <span style={{ fontSize: '0.75rem' }}>{repo.language}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                    {attachmentType === 'project' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="input-group">
                          <label>GitHub Repository Link</label>
                          <input type="text" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/user/repo" />
                        </div>
                        <div className="input-group">
                          <label>Live Demo Link</label>
                          <input type="text" value={demoLink} onChange={(e) => setDemoLink(e.target.value)} placeholder="https://my-project.vercel.app" />
                        </div>
                        <div className="input-group">
                          <label>Tech Stack (comma separated)</label>
                          <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, MongoDB" />
                        </div>
                        <div className="input-group">
                          <label>Project Screenshots (Max 5)</label>
                          <input type="file" multiple accept="image/*" onChange={handleImageFilesChange} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Attachment Previews */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    {selectedRepo && (
                      <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)', position: 'relative' }}>
                        <X size={16} onClick={() => setSelectedRepo(null)} style={{ position: 'absolute', right: '0.5rem', top: '0.5rem', cursor: 'pointer' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Book size={18} color="var(--primary)" />
                          <span style={{ fontWeight: 700 }}>{selectedRepo.name} attached</span>
                        </div>
                      </div>
                    )}
                    
                    {imagePreviews.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', position: 'relative' }}>
                         <button 
                            onClick={() => { setImageFiles([]); setImagePreviews([]); }}
                            style={{ position: 'absolute', right: '-10px', top: '-10px', background: 'white', border: '1px solid var(--border)', borderRadius: '50%', padding: '4px', zIndex: 20, cursor: 'pointer' }}>
                            <X size={14} />
                         </button>
                         {imagePreviews.map((prev, idx) => (
                           <div key={idx} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', height: '100px' }}>
                             <img src={prev} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                           </div>
                         ))}
                      </div>
                    )}

                    {videoPreview && (
                      <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: '#000' }}>
                        <X size={16} onClick={() => { setVideoFile(null); setVideoPreview(''); }} style={{ position: 'absolute', right: '0.5rem', top: '0.5rem', cursor: 'pointer', background: 'white', borderRadius: '50%', padding: '2px', zIndex: 10 }} />
                        <video src={videoPreview} style={{ width: '100%', maxHeight: '200px' }} controls />
                      </div>
                    )}

                    {event.title && (
                      <div style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--primary)', position: 'relative' }}>
                        <X size={16} onClick={() => setEvent({ title: '', date: '' })} style={{ position: 'absolute', right: '0.5rem', top: '0.5rem', cursor: 'pointer' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={18} color="var(--primary)" />
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{event.title}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{event.date}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Image size={24} color={attachmentType === 'image' ? 'var(--primary)' : 'var(--text-light)'} style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('image')} />
                    <Video size={24} color={attachmentType === 'video' ? 'var(--primary)' : 'var(--text-light)'} style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('video')} />
                    <Book size={24} color={attachmentType === 'repo' ? 'var(--primary)' : 'var(--text-light)'} style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('repo')} />
                    <Calendar size={24} color={attachmentType === 'event' ? 'var(--primary)' : 'var(--text-light)'} style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('event')} />
                    <Layout size={24} color={attachmentType === 'project' ? 'var(--primary)' : 'var(--text-light)'} style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('project')} />
                    <Smile size={24} color="var(--text-light)" style={{ cursor: 'pointer' }} />
                  </div>
                  <button
                    disabled={isPosting || (!content.trim() && !selectedRepo && imageFiles.length === 0 && !videoFile && !event.title)}
                    onClick={handlePost}
                    style={{
                      padding: '0.5rem 1.5rem',
                      borderRadius: '20px',
                      background: (isPosting || (!content.trim() && !selectedRepo && imageFiles.length === 0 && !videoFile && !event.title)) ? 'var(--border)' : 'var(--primary)',
                      color: 'white',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      opacity: isPosting ? 0.7 : 1
                    }}
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Posts Feed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Sort by: <span style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>Smart Feed <ChevronDown size={14} /></span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading feed...</div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
            ))
          )}
        </div>
      </main>

      {/* Right Sidebar: Challenges & Suggestions */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <CodingChallenge />

        <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Add to your feed</h3>
            <Info size={16} color="var(--text-light)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {suggestedUsers.map((u) => (
              <div key={u._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Link to={`/profile/${u.username}`}>
                  <img
                    src={u.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    alt=""
                  />
                </Link>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{u.username}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '0.5rem', lineClamp: 1, overflow: 'hidden' }}>{u.bio || 'CodeSphere User'}</p>
                  <button
                    onClick={() => handleFollowSuggestion(u._id)}
                    className="btn btn-outline"
                    style={{
                      padding: '0.2rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: u.isFollowing ? 'var(--text-light)' : 'var(--primary)'
                    }}
                  >
                    {u.isFollowing ? <><Check size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Leaderboard />

        <LivePresence />

        <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Trending Topics</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['#javascript', '#react', '#webdev', '#opensource', '#ai', '#node', '#coding'].map(tag => (
              <span key={tag} style={{ 
                padding: '0.3rem 0.8rem', 
                background: 'var(--primary-light)', 
                color: 'var(--primary)', 
                borderRadius: '15px', 
                fontSize: '0.8rem', 
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 1rem', fontSize: '0.7rem', color: 'var(--text-light)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <span>About</span>
          <span>Help Center</span>
          <span>Privacy & Terms</span>
          <p style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>CodeSphere Corporation © 2026</p>
        </div>
      </aside>
    </div>
  );
};

const Plus = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ChevronRight = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default Home;

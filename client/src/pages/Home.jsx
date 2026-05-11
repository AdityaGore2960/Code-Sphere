import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Image, Video, Calendar, Newspaper, Search, UserPlus, Info, MoreHorizontal, Smile, Share2, MessageCircle, Heart, Book, X, ChevronDown, Users, Layout, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import CodingChallenge from '../components/CodingChallenge';
import Leaderboard from '../components/Leaderboard';
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
    if (!content.trim() && !selectedRepo && imageFiles.length === 0 && !videoFile && !event.title) return;

    try {
      setIsPosting(true);
      const formData = new FormData();
      formData.append('content', content);
      if (selectedRepo && selectedRepo._id) {
        formData.append('repository', selectedRepo._id);
        formData.append('isProject', 'true');
      }
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => formData.append('images', file));
      }
      if (videoFile) formData.append('video', videoFile);
      if (event.title) formData.append('event', JSON.stringify(event));
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
      alert('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '225px 1fr 300px', gap: '1.5rem', padding: '1.5rem 0' }}>
      {/* Left Sidebar */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ height: '60px', background: 'var(--primary)', opacity: 0.8 }}></div>
          <div style={{ textAlign: 'center', marginTop: '-35px', padding: '1rem' }}>
            <Link to={`/profile/${user.username}`}>
              <img src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid white', background: 'white' }} alt="" />
            </Link>
            <h3 style={{ marginTop: '0.75rem', fontSize: '1rem', fontWeight: 700 }}>{user.username}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{user.bio || 'Developer @ CodeSphere'}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Profile views</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>142</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Post impressions</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>1,840</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <img src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} style={{ width: '48px', height: '48px', borderRadius: '50%' }} alt="" />
            <button onClick={() => setIsPostModalOpen(true)} style={{ flex: 1, textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '35px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-light)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Start a post</button>
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
            <button onClick={() => { setIsPostModalOpen(true); setAttachmentType('project'); }} className="post-tool-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              <Layout size={20} color="#9333ea" /> <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>Showcase</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isPostModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ width: '100%', maxWidth: '550px', padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create a post</h2>
                  <button onClick={() => { setIsPostModalOpen(false); setAttachmentType(null); }} style={{ padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }} className="hover-bg"><X size={24} color="var(--text-light)" /></button>
                </div>
                <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                  <textarea autoFocus placeholder="What do you want to talk about?" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', minHeight: '120px', border: 'none', background: 'transparent', fontSize: '1.1rem', resize: 'none', outline: 'none' }}></textarea>
                </div>
                <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Image size={24} color="var(--text-light)" style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('image')} />
                    <Video size={24} color="var(--text-light)" style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('video')} />
                    <Calendar size={24} color="var(--text-light)" style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('event')} />
                    <Layout size={24} color="var(--text-light)" style={{ cursor: 'pointer' }} onClick={() => setAttachmentType('project')} />
                  </div>
                  <button disabled={isPosting || !content.trim()} onClick={handlePost} className="btn btn-primary" style={{ borderRadius: '20px', padding: '0.5rem 1.5rem' }}>{isPosting ? 'Posting...' : 'Post'}</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading feed...</div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)
          )}
        </div>
      </main>

      {/* Right Sidebar */}
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
                  <img src={u.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="" />
                </Link>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{u.username}</h4>
                  <button onClick={() => handleFollowSuggestion(u._id)} className="btn btn-outline" style={{ padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                    {u.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Leaderboard />
        <LivePresence />
      </aside>
    </div>
  );
};

export default Home;

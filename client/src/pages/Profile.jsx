import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link as LinkIcon, MapPin, Calendar, Edit3, UserPlus, UserMinus, Star, GitFork, Code, BookOpen, Layers, Heart, Search, Camera, Upload, Image, X, Video, Plus, Trash2, PlusCircle, Briefcase, GraduationCap, Award, FileText } from 'lucide-react';
import PostCard from '../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useCall } from '../context/CallContext';

const trialRepos = [
  {
    _id: 'trial-1',
    name: 'CodeSphere-Core',
    description: 'The core architecture for the CodeSphere developer social platform. High-performance, scalable, and modular.',
    stargazers_count: 124,
    forks_count: 42,
    language: 'JavaScript',
    owner: { username: 'System', profilePic: 'https://api.dicebear.com/7.x/identicon/svg?seed=System' },
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'trial-2',
    name: 'DevPulse-Analytics',
    description: 'A real-time data visualization engine for tracking developer contributions and community growth metrics.',
    stargazers_count: 89,
    forks_count: 18,
    language: 'TypeScript',
    owner: { username: 'System', profilePic: 'https://api.dicebear.com/7.x/identicon/svg?seed=System' },
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'trial-3',
    name: 'Astra-UI-Library',
    description: 'A premium, accessible component library designed specifically for data-intensive developer tools and dashboards.',
    stargazers_count: 215,
    forks_count: 31,
    language: 'React',
    owner: { username: 'System', profilePic: 'https://api.dicebear.com/7.x/identicon/svg?seed=System' },
    updatedAt: new Date().toISOString()
  }
];

const Profile = () => {
  const { callUser } = useCall();
  const { username } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';

  const { user: currentUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [localRepos, setLocalRepos] = useState([]);
  const [communityRepos, setCommunityRepos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempImagePreview, setTempImagePreview] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [codingStats, setCodingStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isEditingHandles, setIsEditingHandles] = useState(false);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);
  const [repoSearch, setRepoSearch] = useState('');
  const [repoType, setRepoType] = useState('all');
  const [repoLanguage, setRepoLanguage] = useState('all');
  const [repoSort, setRepoSort] = useState('updated');
  const [repoToDelete, setRepoToDelete] = useState(null);
  const [isDeletingRepo, setIsDeletingRepo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const menuRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [tempBannerFile, setTempBannerFile] = useState(null);
  const [tempBannerPreview, setTempBannerPreview] = useState('');
  const [tempResumeFile, setTempResumeFile] = useState(null);
  const [tempCertFiles, setTempCertFiles] = useState({}); // certification index -> file

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

      try {
        const githubRes = await axios.get(`/users/github/${data.githubUsername || username}`);
        setRepos(githubRes.data);
      } catch (ghErr) {
        console.warn('Could not fetch GitHub repositories:', ghErr.response?.data?.message || ghErr.message);
        setRepos([]); // Fallback to empty list
      }

      const localRes = await axios.get(`/repos/${username}`);
      setLocalRepos(localRes.data);

      const communityRes = await axios.get('/repos');
      setCommunityRepos(communityRes.data);

      const postRes = await axios.get('/posts/explore');
      setPosts(postRes.data.filter(p => p.user.username === username));

      // Fetch Coding Stats
      if (data.githubUsername || data.leetcodeUsername || data.codeforcesUsername) {
        setStatsLoading(true);
        try {
          const statsRes = await axios.get(`/stats/${username}?github=${data.githubUsername || ''}&leetcode=${data.leetcodeUsername || ''}&codeforces=${data.codeforcesUsername || ''}`);
          setCodingStats(statsRes.data);
        } catch (e) {
          console.error("Error fetching stats:", e);
        } finally {
          setStatsLoading(false);
        }
      }
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
      formData.append('headline', editData.headline || '');
      formData.append('bio', editData.bio || '');
      formData.append('pronouns', editData.pronouns || '');
      formData.append('githubUsername', editData.githubUsername || '');
      formData.append('leetcodeUsername', editData.leetcodeUsername || '');
      formData.append('codeforcesUsername', editData.codeforcesUsername || '');

      if (editData.socialLinks) {
        formData.append('socialLinks', JSON.stringify(editData.socialLinks));
      }

      if (editData.skills) {
        formData.append('skills', JSON.stringify(editData.skills));
      }

      if (editData.interests) {
        formData.append('interests', JSON.stringify(editData.interests));
      }

      if (tempImageFile) {
        formData.append('profilePic', tempImageFile);
      }

      if (tempBannerFile) {
        formData.append('banner', tempBannerFile);
      }

      if (tempResumeFile) {
        formData.append('resume', tempResumeFile);
      }

      // Handle certifications - we send them as a JSON string, 
      // and files separately if needed. For now, let's just handle the text part.
      if (editData.certifications) {
        formData.append('certifications', JSON.stringify(editData.certifications));
      }

      if (editData.experience) {
        formData.append('experience', JSON.stringify(editData.experience));
      }

      if (editData.education) {
        formData.append('education', JSON.stringify(editData.education));
      }

      // Append certification files with indexed field names
      Object.keys(tempCertFiles).forEach(index => {
        formData.append(`certFile_${index}`, tempCertFiles[index]);
      });

      const updatedData = await updateProfile(formData);
      console.log('Profile updated successfully:', updatedData);
      setProfile(updatedData);
      setIsEditing(false);
      setTempImageFile(null);
      setTempImagePreview('');
      setTempBannerFile(null);
      setTempBannerPreview('');
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

  const addExperience = () => {
    const newExp = { title: '', company: '', duration: '', description: '' };
    setEditData({ ...editData, experience: [...(editData.experience || []), newExp] });
  };

  const removeExperience = (index) => {
    const newExp = [...editData.experience];
    newExp.splice(index, 1);
    setEditData({ ...editData, experience: newExp });
  };

  const addEducation = () => {
    const newEdu = { school: '', degree: '', fieldOfStudy: '', from: '', to: '', description: '' };
    setEditData({ ...editData, education: [...(editData.education || []), newEdu] });
  };

  const removeEducation = (index) => {
    const newEdu = [...editData.education];
    newEdu.splice(index, 1);
    setEditData({ ...editData, education: newEdu });
  };

  const addCertification = () => {
    const newCert = { name: '', organization: '', issueDate: '', credentialUrl: '', file: '' };
    setEditData({ ...editData, certifications: [...(editData.certifications || []), newCert] });
  };

  const removeCertification = (index) => {
    const newCerts = [...editData.certifications];
    newCerts.splice(index, 1);
    setEditData({ ...editData, certifications: newCerts });
  };

  if (!profile) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10rem' }}><p className="fade-in">Loading profile...</p></div>;

  const projects = posts.filter(p => p.isProject);
  const likedPosts = posts.filter(p => p.likes?.includes(profile._id));

  // Combined repositories from all sources: GitHub, Local User, Community, and Trial
  const allRepos = [
    ...repos,
    ...localRepos,
    ...communityRepos.filter(cr => cr.owner?.username !== username), // Avoid duplicates of current user's local repos
    ...trialRepos
  ];

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

  const renderCodingDashboard = () => {
    if (!codingStats || statsLoading) {
      return (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          {statsLoading ? <p className="loading-dots">Fetching live coding stats...</p> : <p>Add GitHub, LeetCode, or Codeforces handles to see your dashboard.</p>}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {/* GitHub Quick Stats */}
          {codingStats.github && (
            <motion.div whileHover={{ y: -5 }} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2ea44f' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Layers size={20} color="#2ea44f" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>GitHub Activity</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Repos</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{codingStats.github.public_repos}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Followers</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{codingStats.github.followers}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* LeetCode Stats */}
          {codingStats.leetcode && (
            <motion.div whileHover={{ y: -5 }} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ffa116' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Code size={20} color="#ffa116" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>LeetCode Progress</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Solved</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{codingStats.leetcode.totalSolved}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Ranking</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>#{codingStats.leetcode.ranking}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Codeforces Stats */}
          {codingStats.codeforces && (
            <motion.div whileHover={{ y: -5 }} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3182ce' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Star size={20} color="#3182ce" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Codeforces Rating</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Rating</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3182ce' }}>{codingStats.codeforces.rating}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Max Rank</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800 }}>{codingStats.codeforces.maxRank}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* LeetCode Pie Chart */}
          {codingStats.leetcode && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>LeetCode Difficulty Split</h4>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Easy', value: codingStats.leetcode.easySolved },
                        { name: 'Medium', value: codingStats.leetcode.mediumSolved },
                        { name: 'Hard', value: codingStats.leetcode.hardSolved },
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#00b8a3" />
                      <Cell fill="#ffc01e" />
                      <Cell fill="#ef4743" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: '#00b8a3' }}>● Easy</span>
                <span style={{ color: '#ffc01e' }}>● Medium</span>
                <span style={{ color: '#ef4743' }}>● Hard</span>
              </div>
            </div>
          )}

          {/* Codeforces Rating Chart */}
          {codingStats.codeforces?.ratingHistory?.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Codeforces Rating History</h4>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={codingStats.codeforces.ratingHistory.slice(-10)}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="ratingUpdateTimeSeconds" hide />
                    <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                    <Tooltip labelFormatter={() => 'Rating'} />
                    <Area type="monotone" dataKey="newRating" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRating)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Top Languages */}
        {codingStats.github?.top_repos?.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Top Languages (GitHub)</h4>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(
                  codingStats.github.top_repos.reduce((acc, repo) => {
                    if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([name, count]) => ({ name, count }))}>
                  <XAxis dataKey="name" />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

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

                {/* Coding Dashboard */}
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code size={20} color="var(--primary)" /> Coding Dashboard</h3>
                    {currentUser.username === username && (
                      <button
                        onClick={() => setIsEditingHandles(true)}
                        style={{ fontSize: '0.85rem', color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Edit3 size={14} /> Configure
                      </button>
                    )}
                  </div>
                  {renderCodingDashboard()}
                </section>

                {/* Recent Activity */}
                <section>
                  <h3 style={{ marginBottom: '1.25rem' }}>All Posts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {posts.length > 0 ? posts.map(post => (
                      <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
                    )) : <p>No activity yet.</p>}
                  </div>
                </section>

                {/* Professional History */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <section>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={20} color="var(--primary)" /> Experience</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.experience?.length > 0 ? profile.experience.map((exp, i) => (
                        <div key={i} className="card" style={{ padding: '1rem' }}>
                          <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{exp}</p>
                        </div>
                      )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>No experience listed.</p>}
                    </div>
                  </section>

                  <section>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><GraduationCap size={20} color="var(--primary)" /> Education</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.education?.length > 0 ? profile.education.map((edu, i) => (
                        <div key={i} className="card" style={{ padding: '1rem' }}>
                          <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{edu}</p>
                        </div>
                      )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>No education listed.</p>}
                    </div>
                  </section>
                </div>

                {/* Certifications */}
                <section>
                  <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={20} color="var(--primary)" /> Certifications</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {profile.certifications?.length > 0 ? profile.certifications.map((cert, i) => (
                      <div key={i} className="card" style={{ padding: '1.25rem', position: 'relative' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{cert.name}</h4>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>{cert.organization}</p>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>View Credential</a>
                        )}
                      </div>
                    )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>No certifications listed.</p>}
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
                <Link to={`/repo/${username}/${repo.name}`} key={repo._id || repo.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', transition: 'var(--transition)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{repo.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg)', color: 'var(--text-light)', border: '1px solid var(--border)' }}>
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                      {currentUser.username === username && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setRepoToDelete(repo);
                          }}
                          style={{ background: 'none', border: 'none', color: '#cf222e', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
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
                </Link>
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
                  <Link to={`/repo/${repo.owner?.username || username}/${repo.name}`} key={repo._id || repo.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{repo.name}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem', flex: 1 }}>{repo.description || 'No description provided'}</p>
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={16} color="#eab308" fill="#eab308" /> {repo.stargazers_count}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><GitFork size={16} /> {repo.forks_count}</span>
                      {repo.language && <span className="tag" style={{ marginLeft: 'auto' }}>{repo.language}</span>}
                    </div>
                  </Link>
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


  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const cleanProfile = { ...profile };
        delete cleanProfile.followers;
        delete cleanProfile.following;

        await updateProfile({ ...cleanProfile, banner: base64String });
        setProfile({ ...profile, banner: base64String });
        alert('Profile banner updated successfully!');
      } catch (err) {
        console.error('Failed to update profile banner:', err);
        alert('Failed to update profile banner');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Repo Delete Modal */}
      {repoToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ maxWidth: '450px', width: '90%', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Delete Repository</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setRepoToDelete(null)} />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Are you sure you want to delete <strong>{repoToDelete.name}</strong>? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRepoToDelete(null)}>Cancel</button>
                <button
                  className="btn"
                  style={{ flex: 1, background: '#cf222e', color: 'white' }}
                  disabled={isDeletingRepo}
                  onClick={async () => {
                    setIsDeletingRepo(true);
                    try {
                      await axios.delete(`/repos/${repoToDelete._id}`);
                      setLocalRepos(localRepos.filter(r => r._id !== repoToDelete._id));
                      setRepoToDelete(null);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to delete repository');
                    } finally {
                      setIsDeletingRepo(false);
                    }
                  }}
                >
                  {isDeletingRepo ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Profile Header */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <div style={{
          background: profile.banner ? `url(${profile.banner}) center/cover no-repeat` : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          height: '220px',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>

          {currentUser.username === username && (
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10 }}>
              <button
                onClick={() => bannerInputRef.current.click()}
                style={{ background: 'white', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
                <Camera size={20} color="var(--primary)" />
              </button>
              <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleBannerChange} />
            </div>
          )}
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
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} style={isFollowing ? { background: 'white' } : {}} onClick={handleFollow}>
                    {isFollowing ? <><UserMinus size={18} /> Unfollow</> : <><UserPlus size={18} /> Follow</>}
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ background: '#ecfdf5', color: '#059669', borderColor: '#10b981' }}
                    onClick={() => callUser(profile._id)}
                  >
                    <Video size={18} /> Start Interview
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{profile.name || profile.username}</h1>
              {profile.pronouns && <span style={{ color: 'var(--text-light)', fontSize: '1rem', marginTop: '0.5rem' }}>({profile.pronouns})</span>}
              <span className="badge badge-project" style={{ marginTop: '0.5rem' }}>Dev</span>
            </div>
            {profile.headline && <p style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem' }}>{profile.headline}</p>}
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
                <span><strong>{profile.followers?.length || 0}</strong> <span style={{ color: 'var(--text-light)' }}>followers</span></span>
                <span><strong>{profile.following?.length || 0}</strong> <span style={{ color: 'var(--text-light)' }}>following</span></span>
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
        {isEditingHandles && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Configure Dashboard</h2>
                <button onClick={() => setIsEditingHandles(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
              </div>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enter your usernames to sync your real-time coding statistics from GitHub, LeetCode, and Codeforces.</p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsUpdating(true);
                try {
                  const formData = new FormData();
                  formData.append('githubUsername', editData.githubUsername || '');
                  formData.append('leetcodeUsername', editData.leetcodeUsername || '');
                  formData.append('codeforcesUsername', editData.codeforcesUsername || '');
                  await updateProfile(formData);
                  setIsEditingHandles(false);
                  fetchProfile(); // Refresh profile and stats
                  alert('Handles updated successfully!');
                } catch (err) {
                  alert('Failed to update handles');
                } finally {
                  setIsUpdating(false);
                }
              }}>
                <div className="input-group">
                  <label>GitHub Username</label>
                  <input type="text" value={editData.githubUsername || ''} onChange={e => setEditData({ ...editData, githubUsername: e.target.value })} placeholder="e.g. johndev" />
                </div>
                <div className="input-group">
                  <label>LeetCode Username</label>
                  <input type="text" value={editData.leetcodeUsername || ''} onChange={e => setEditData({ ...editData, leetcodeUsername: e.target.value })} placeholder="e.g. john_lc" />
                </div>
                <div className="input-group">
                  <label>Codeforces Username</label>
                  <input type="text" value={editData.codeforcesUsername || ''} onChange={e => setEditData({ ...editData, codeforcesUsername: e.target.value })} placeholder="e.g. john_cf" />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditingHandles(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Sync Data'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card"
              style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Edit Profile</h2>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setTempImageFile(null); setTempImagePreview(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Profile Banner</p>
                  <div style={{
                    width: '100%',
                    height: '120px',
                    borderRadius: '8px',
                    background: tempBannerPreview || editData.banner ? `url(${tempBannerPreview || editData.banner}) center/cover no-repeat` : 'var(--primary-light)',
                    position: 'relative',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                  }}>
                    <label style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                    >
                      <Upload color="white" size={24} />
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setTempBannerFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setTempBannerPreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', width: '100px', height: '100px', marginTop: '-50px' }}>
                    <img
                      src={tempImagePreview || editData.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                      style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: 'var(--shadow)' }}
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>Profile Picture</p>
                </div>


                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      id="profile-name"
                      name="name"
                      value={editData.name || ''}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
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
                      onChange={e => setEditData({ ...editData, pronouns: e.target.value })}
                      placeholder="e.g. they/them"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Headline</label>
                  <input
                    type="text"
                    value={editData.headline || ''}
                    onChange={e => setEditData({ ...editData, headline: e.target.value })}
                    placeholder="e.g. Full Stack Developer | React Expert | Open Source Contributor"
                  />
                </div>

                <div className="input-group">
                  <label>Bio</label>
                  <textarea
                    id="profile-bio"
                    name="bio"
                    value={editData.bio || ''}
                    onChange={e => setEditData({ ...editData, bio: e.target.value })}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="input-group" style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} /> Resume (PDF)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setTempResumeFile(e.target.files[0])}
                      style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                    {profile.resume && (
                      <a href={profile.resume} target="_blank" rel="noreferrer" className="tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>Current Resume</a>
                    )}
                  </div>
                </div>

                {/* Skills Section */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code size={18} /> Skills</h4>
                  </div>
                  <input
                    type="text"
                    value={Array.isArray(editData.skills) ? editData.skills.join(', ') : editData.skills || ''}
                    onChange={e => setEditData({ ...editData, skills: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="e.g. React, Node.js, Python (comma separated)"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>

                {/* Experience Section */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={18} /> Experience</h4>
                  </div>
                  <textarea
                    value={Array.isArray(editData.experience) ? editData.experience.join(', ') : editData.experience || ''}
                    onChange={e => setEditData({ ...editData, experience: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="e.g. Senior Developer at Google (2020-2024), Software Engineer at Microsoft (2018-2020)"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '80px', resize: 'vertical' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Separate multiple experiences with commas.</p>
                </div>

                {/* Education Section */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><GraduationCap size={18} /> Education</h4>
                  </div>
                  <textarea
                    value={Array.isArray(editData.education) ? editData.education.join(', ') : editData.education || ''}
                    onChange={e => setEditData({ ...editData, education: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="e.g. B.S. Computer Science at Stanford University (2016-2020), M.S. AI at MIT (2020-2022)"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '80px', resize: 'vertical' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Separate multiple educations with commas.</p>
                </div>

                {/* Certifications Section */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={18} /> Certifications</h4>
                    <button type="button" onClick={addCertification} className="btn btn-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.4rem', borderRadius: '50%' }}>
                      <Plus size={18} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editData.certifications?.map((cert, index) => (
                      <div key={index} className="card" style={{ padding: '1rem', background: 'var(--bg)', position: 'relative' }}>
                        <button type="button" onClick={() => removeCertification(index)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#ef4444' }} className="btn-icon">
                          <Trash2 size={16} />
                        </button>
                        <div className="input-group">
                          <label>Certification Name</label>
                          <input type="text" value={cert.name} onChange={e => {
                            const newCerts = [...editData.certifications];
                            newCerts[index].name = e.target.value;
                            setEditData({ ...editData, certifications: newCerts });
                          }} placeholder="e.g. AWS Certified Developer" />
                        </div>
                        <div className="input-group">
                          <label>Issuing Organization</label>
                          <input type="text" value={cert.organization} onChange={e => {
                            const newCerts = [...editData.certifications];
                            newCerts[index].organization = e.target.value;
                            setEditData({ ...editData, certifications: newCerts });
                          }} placeholder="e.g. Amazon Web Services" />
                        </div>
                        <div className="input-group">
                          <label>Credential URL (Optional)</label>
                          <input type="text" value={cert.credentialUrl} onChange={e => {
                            const newCerts = [...editData.certifications];
                            newCerts[index].credentialUrl = e.target.value;
                            setEditData({ ...editData, certifications: newCerts });
                          }} placeholder="https://..." />
                        </div>
                        <div className="input-group">
                          <label>Certificate File (PDF/Image)</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="file"
                              onChange={(e) => {
                                setTempCertFiles({ ...tempCertFiles, [index]: e.target.files[0] });
                              }}
                              style={{ flex: 1, fontSize: '0.8rem' }}
                            />
                            {cert.file && <span className="tag" style={{ background: '#f0fdf4', color: '#16a34a' }}>Uploaded</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      onChange={e => setEditData({ ...editData, githubUsername: e.target.value })}
                      placeholder="your-github-username"
                    />
                  </div>
                  <div className="input-group">
                    <label>LeetCode Username</label>
                    <input
                      type="text"
                      id="profile-leetcode"
                      name="leetcodeUsername"
                      value={editData.leetcodeUsername || ''}
                      onChange={e => setEditData({ ...editData, leetcodeUsername: e.target.value })}
                      placeholder="leetcode-username"
                    />
                  </div>
                  <div className="input-group">
                    <label>Codeforces Username</label>
                    <input
                      type="text"
                      id="profile-codeforces"
                      name="codeforcesUsername"
                      value={editData.codeforcesUsername || ''}
                      onChange={e => setEditData({ ...editData, codeforcesUsername: e.target.value })}
                      placeholder="codeforces-username"
                    />
                  </div>
                  <div className="input-group">
                    <label>LinkedIn</label>
                    <input
                      type="text"
                      value={editData.socialLinks?.linkedin || ''}
                      onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, linkedin: e.target.value } })}
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="input-group">
                    <label>Twitter</label>
                    <input
                      type="text"
                      value={editData.socialLinks?.twitter || ''}
                      onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, twitter: e.target.value } })}
                      placeholder="Twitter URL"
                    />
                  </div>
                  <div className="input-group">
                    <label>Portfolio</label>
                    <input
                      type="text"
                      value={editData.socialLinks?.portfolio || ''}
                      onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, portfolio: e.target.value } })}
                      placeholder="Portfolio URL"
                    />
                  </div>
                </div>

                <div className="input-group" style={{ marginTop: '1.5rem' }}>
                  <label>Interests (comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editData.interests) ? editData.interests.join(', ') : editData.interests || ''}
                    onChange={e => setEditData({ ...editData, interests: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="e.g. react, javascript, ai, open-source"
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Used to personalize your smart feed.</p>
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

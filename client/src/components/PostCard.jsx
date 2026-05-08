import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Code, ExternalLink, MoreVertical, Book, Star, GitFork, Calendar, Check, UserPlus, Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user._id));
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [isFollowing, setIsFollowing] = useState(user.following?.includes(post.user._id));
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = user && (post.user._id === user._id || post.user === user._id);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.post(`/users/follow/${post.user._id}`);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await axios.post(`/posts/like/${post._id}`);
      setLikes(data);
      setIsLiked(data.includes(user._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      const { data } = await axios.post(`/posts/comment/${post._id}`, { content: commentContent });
      setComments(data);
      setCommentContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card fade-in"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/profile/${post.user.username}`}>
            <img
              src={post.user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}`}
              alt={post.user.username}
              crossOrigin="anonymous"
              style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }}
            />
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to={`/profile/${post.user.username}`} style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', textDecoration: 'none' }}>
                {post.user.username}
              </Link>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>• 2nd</span>
              {user._id !== post.user._id && (
                <button
                  onClick={handleFollow}
                  style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  {isFollowing ? (
                    <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Check size={16} /> Following
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <UserPlus size={16} /> Follow
                    </span>
                  )}
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {post.isProject && <span className="badge badge-project">Project</span>}
          {isOwner && (
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '0.5rem', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              title="Delete post"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem', color: '#334155' }}>
        {post.content}
      </p>

      {/* Multi-Image Grid */}
      {post.images && post.images.length > 0 && (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: post.images.length === 1 ? '1fr' : post.images.length === 2 ? '1fr 1fr' : '1fr 1fr', 
            gap: '2px', 
            marginBottom: '1.25rem', 
            borderRadius: '10px', 
            overflow: 'hidden', 
            border: '1px solid var(--border)' 
        }}>
          {post.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              crossOrigin="anonymous"
              style={{ 
                  width: '100%', 
                  height: post.images.length > 2 ? '200px' : '400px', 
                  objectFit: 'cover' 
              }}
              alt={`Post attachment ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Single Image Attachment (Legacy) */}
      {post.image && post.image.trim() !== '' && (!post.images || post.images.length === 0) && (
        <div style={{ marginBottom: '1.25rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img
            src={post.image}
            crossOrigin="anonymous"
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
            alt="Post attachment"
            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Video Attachment */}
      {post.video && (
        <div style={{ marginBottom: '1.25rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: '#000' }}>
          {post.video.includes('youtube.com') || post.video.includes('youtu.be') ? (
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${post.video.split('v=')[1]?.split('&')[0] || post.video.split('/').pop()}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video controls style={{ width: '100%', maxHeight: '500px' }}>
              <source src={post.video} type="video/mp4" />
              <source src={post.video} type="video/webm" />
              <source src={post.video} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}


      {/* Event Showcase */}
      {post.event && post.event.title && (
        <div style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg) 100%)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid var(--primary)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', minWidth: '70px', boxShadow: 'var(--shadow)' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              {new Date(post.event.date).toLocaleString('default', { month: 'short' })}
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
              {new Date(post.event.date).getDate()}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{post.event.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} /> {new Date(post.event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>View Event</button>
          </div>
        </div>
      )}

      {/* Repository Showcase */}
      {post.repository && (
        <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Book size={22} color="var(--primary)" />
            <Link to={`/repo/${post.repository.owner?.username || post.user.username}/${post.repository.name}`} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
              {post.repository.name}
            </Link>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {post.repository.description || 'No description provided for this repository.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={16} /> {post.repository.stargazers_count || 0}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><GitFork size={16} /> {post.repository.forks_count || 0}</span>
              {post.repository.language && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                  {post.repository.language}
                </span>
              )}
            </div>
            <Link to={`/repo/${post.repository.owner?.username || post.user.username}/${post.repository.name}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
              View Repository
            </Link>
          </div>
        </div>
      )}

      {/* Project Details */}
      {post.isProject && (
        <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--primary)', opacity: 0.9 }}>
          {post.techStack && post.techStack.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {post.techStack.map(tech => (
                <span key={tech} className="tag" style={{ background: '#fff' }}>{tech}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {post.githubLink && (
              <a href={post.githubLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#fff' }}>
                <Code size={14} /> Repo
              </a>
            )}
            {post.demoLink && (
              <a href={post.demoLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button
            onClick={handleLike}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isLiked ? '#ef4444' : 'inherit' }}
          >
            <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} />
            <span style={{ fontSize: '0.9rem' }}>{likes.length}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <MessageCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{comments.length}</span>
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Share2 size={20} />
          </button>
        </div>
        <button>
          <Bookmark size={20} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <form onSubmit={handleComment} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg)' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', borderRadius: '20px' }}>Post</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {comments.map((comment, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                <img src={comment.user?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username}`} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                <div style={{ background: 'var(--bg)', padding: '0.6rem 0.8rem', borderRadius: '12px', flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{comment.user?.username}</p>
                  <p style={{ fontSize: '0.85rem' }}>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.4)', 
            backdropFilter: 'blur(4px)', 
            zIndex: 3000, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '1rem'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="card" 
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                padding: '2rem', 
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                border: '1px solid var(--border)',
                background: '#fff'
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#fee2e2', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.5rem',
                color: '#ef4444'
              }}>
                <AlertTriangle size={30} />
              </div>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>
                Delete Post?
              </h3>
              
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem', lineHeight: 1.5 }}>
                This action cannot be undone. This will permanently remove this post and all its interactions.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '0.75rem' }}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="btn btn-primary" 
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: '#ef4444', 
                    borderColor: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : <><Trash2 size={18} /> Delete</>}
                </button>
              </div>
              
              <button 
                onClick={() => setShowDeleteModal(false)}
                style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  padding: '0.4rem', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  color: 'var(--text-light)'
                }}
                className="hover-bg"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;

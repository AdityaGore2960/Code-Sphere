const express = require('express');
const router = express.Router();
const {
  createPost, getFeed, getExplore, likePost, addComment, getProjects, bookmarkPost, deletePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('image'), createPost);
router.get('/', protect, getFeed);
router.get('/explore', getExplore);
router.get('/projects', getProjects);
router.post('/like/:id', protect, likePost);
router.post('/comment/:id', protect, addComment);
router.post('/bookmark/:id', protect, bookmarkPost);
router.delete('/:id', protect, deletePost);

module.exports = router;

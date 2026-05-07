# CodeSphere - Developer Social Platform

A modern, full-stack social platform for developers built with the MERN stack.

## Features
- **JWT Authentication**: Secure login and registration.
- **Developer Profiles**: Bio, skills, and social links.
- **GitHub Integration**: Automatically fetch and display user repositories.
- **Post Interaction**: Create posts, like, and comment.
- **Project Showcase Mode**: Mark posts as projects with tech stack tags and demo links.
- **Social Features**: Follow/Unfollow system and personalized feed.
- **Search**: Find developers by username or expertise.
- **Notifications**: Real-time feedback for likes, comments, and follows.

## Tech Stack
- **Frontend**: React, Framer Motion, Lucide Icons, Vanilla CSS.
- **Backend**: Node.js, Express, MongoDB, JWT.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB (Local or Atlas)

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secret key for tokens.
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm run dev
   ```

## API Documentation

### Auth
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate user and get token.

### Users
- `GET /api/users/profile/:username`: Get user profile.
- `PUT /api/users/profile`: Update current user profile.
- `POST /api/users/follow/:id`: Follow or unfollow a user.
- `GET /api/users/search?query=...`: Search users by username or skills.
- `GET /api/users/github/:username`: Proxy GitHub API to fetch repositories.

### Posts
- `GET /api/posts`: Get feed (following + self).
- `GET /api/posts/explore`: Get all posts (trending).
- `POST /api/posts`: Create a new post or project.
- `POST /api/posts/like/:id`: Like or unlike a post.
- `POST /api/posts/comment/:id`: Add a comment to a post.
- `GET /api/posts/projects?tech=...`: Filter projects by tech stack.

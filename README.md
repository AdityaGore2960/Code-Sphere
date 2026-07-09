# 🚀 CodeSphere: The Ultimate Developer Social Ecosystem

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/AdityaGore2960/Code-Sphere)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CodeSphere is a high-performance, full-stack developer social networking platform designed to bridge the gap between community interaction and career growth. It features real-time repository synchronization, automated coding dashboards, and a live job ecosystem.

---

## ✨ Key Features (Interview Highlights)

*   **👨‍💻 Developer Profiles 2.0**: Automated synchronization of GitHub repositories and real-time contribution metrics.
*   **📊 Coding Dashboards**: Live data aggregation from **LeetCode**, **Codeforces**, and **GitHub** for a unified developer identity.
*   **💼 Real-Time Job Board**: Dynamic job discovery powered by the **JSearch API**, featuring advanced filtering for developers.
*   **🏗️ Project Showcase Mode**: Dedicated "Project" posts featuring live demo links, repository tags, and tech stack badges.
*   **📹 Instant Collaboration**: Integrated **WebRTC Video Calling** for peer-to-peer technical interviews and pair programming.
*   **📰 Smart Feed**: Personalized content stream with media support (Images/Video) and real-time social interactions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS (Custom Glassmorphic Design System)
- **Animations**: Framer Motion
- **Analytics**: Recharts (D3-based visualization)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Media**: Cloudinary SDK (Image/Video cloud storage)
- **Services**: Socket.io (Real-time events), WebRTC (Signal-based calling)

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v16.x or higher)
- MongoDB (Local or Atlas)
- GitHub Personal Access Token (for Repo Sync)

### 2. Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GITHUB_TOKEN=ghp_your_github_token
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAPID_API_KEY=your_jsearch_api_key
```

### 3. Installation
```bash
# Clone the repository
git clone https://github.com/AdityaGore2960/Code-Sphere.git
cd Code-Sphere

# Install and Start Backend
cd server
npm install
npm run dev

# Install and Start Frontend (New terminal)
cd client
npm install
npm run dev
```

---

## 🏗️ System Architecture

CodeSphere utilizes a **Modular Monolith** pattern:
- **Client**: Single Page Application (SPA) with context-based state management (`AuthContext`, `CallContext`).
- **Server**: RESTful API with dedicated controllers for `Posts`, `Users`, `Repos`, and `Jobs`.
- **Middleware**: Professional error-handling layer and JWT-based protection for sensitive routes.

---

## 🛣️ API Documentation

### Auth & User
- `POST /api/auth/register` - Create new developer account
- `GET /api/users/profile/:username` - Fetch full developer profile data
- `GET /api/stats/:username` - Aggregated coding stats from 3rd-party platforms

### Repositories & Jobs
- `GET /api/users/github/:username` - GitHub repository proxy service
- `GET /api/repos` - Explore community-wide developer projects
- `GET /api/jobs/search` - Real-time job board data fetch

---

## 📈 Challenges & Learnings

- **Multi-Source Data Merging**: Implemented a robust logic in `Profile.jsx` to seamlessly combine GitHub APIs, internal MongoDB projects, and community trial data.
- **Graceful Error Handling**: Developed a resilient backend that continues to serve profile data even if external APIs (like GitHub) are rate-limited or unavailable.
- **Real-Time UX**: Leveraged Socket.io and custom React hooks to ensure the social feed and notifications feel instantaneous.

---

## 📬 Contact

Aditya Gore - [GitHub](https://github.com/AdityaGore2960) | [LinkedIn](www.linkedin.com/in/aditya-gore-370897333)

Project Link: [https://github.com/AdityaGore2960/Code-Sphere](https://github.com/AdityaGore2960/Code-Sphere)

<!---LeetCode Topics Start-->
# LeetCode Topics
## Array
|  |
| ------- |
| [0049-group-anagrams](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0049-group-anagrams) |
## Hash Table
|  |
| ------- |
| [0049-group-anagrams](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0049-group-anagrams) |
| [0076-minimum-window-substring](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0076-minimum-window-substring) |
| [0141-linked-list-cycle](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0141-linked-list-cycle) |
| [0142-linked-list-cycle-ii](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0142-linked-list-cycle-ii) |
| [0202-happy-number](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0202-happy-number) |
## String
|  |
| ------- |
| [0049-group-anagrams](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0049-group-anagrams) |
| [0076-minimum-window-substring](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0076-minimum-window-substring) |
## Sorting
|  |
| ------- |
| [0049-group-anagrams](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0049-group-anagrams) |
## Sliding Window
|  |
| ------- |
| [0076-minimum-window-substring](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0076-minimum-window-substring) |
## Linked List
|  |
| ------- |
| [0021-merge-two-sorted-lists](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0021-merge-two-sorted-lists) |
| [0083-remove-duplicates-from-sorted-list](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0083-remove-duplicates-from-sorted-list) |
| [0141-linked-list-cycle](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0141-linked-list-cycle) |
| [0142-linked-list-cycle-ii](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0142-linked-list-cycle-ii) |
## Recursion
|  |
| ------- |
| [0021-merge-two-sorted-lists](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0021-merge-two-sorted-lists) |
## Two Pointers
|  |
| ------- |
| [0141-linked-list-cycle](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0141-linked-list-cycle) |
| [0142-linked-list-cycle-ii](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0142-linked-list-cycle-ii) |
| [0202-happy-number](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0202-happy-number) |
## Math
|  |
| ------- |
| [0202-happy-number](https://github.com/AdityaGore2960/Code-Sphere/tree/master/0202-happy-number) |
<!---LeetCode Topics End-->
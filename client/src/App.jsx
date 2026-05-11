import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { SocketProvider } from './context/SocketContext';
import { CallProvider } from './context/CallContext';
import CallManager from './components/CallManager';
import Navbar from './components/Navbar';
import MessagingDrawer from './components/MessagingDrawer';
import AIAgent from './components/AIAgent';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Showcase from './pages/Showcase';
import Notifications from './pages/Notifications';
import Search from './pages/Search';
import CreateRepo from './pages/CreateRepo';
import Repositories from './pages/Repositories';
import RepositoryDetail from './pages/RepositoryDetail';
import SettingsPage from './pages/Settings';
import Jobs from './pages/Jobs';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <ChatProvider>
            <Router>
              <Navbar />
              <CallManager />
              <main className="container main-content">
                <Routes>
                  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/showcase" element={<ProtectedRoute><Showcase /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                  <Route path="/create-repo" element={<ProtectedRoute><CreateRepo /></ProtectedRoute>} />
                  <Route path="/repositories" element={<ProtectedRoute><Repositories /></ProtectedRoute>} />
                  <Route path="/repo/:username/:repoName" element={<ProtectedRoute><RepositoryDetail /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                </Routes>
              </main>
              <MessagingDrawer />
              <AIAgent />
            </Router>
          </ChatProvider>
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;

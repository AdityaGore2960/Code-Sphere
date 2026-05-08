import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, MessageSquare, History, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('chat'); // 'chat' or 'history'
  const chatEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/agent/history', config);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await axios.post('http://localhost:5000/api/agent/task', { task: input }, config);
      
      const agentMessage = { role: 'agent', text: data.response };
      setMessages(prev => [...prev, agentMessage]);
      fetchHistory(); // Update history
    } catch (error) {
      console.error('Agent error:', error);
      setMessages(prev => [...prev, { role: 'agent', text: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="ai-agent-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="ai-agent-container"
          >
            {/* Header */}
            <div className="ai-agent-header">
              <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-400" size={20} />
                <h3 className="font-bold">CodeSphere AI Agent</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setView(view === 'chat' ? 'history' : 'chat')}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title={view === 'chat' ? 'View History' : 'Back to Chat'}
                >
                  {view === 'chat' ? <History size={20} /> : <MessageSquare size={20} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-700 rounded transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="ai-agent-body">
              {view === 'chat' ? (
                <>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                      <Bot size={48} className="mb-4 opacity-20" />
                      <p>Hello! I'm your CodeSphere AI Agent. How can I help you today?</p>
                      <p className="text-xs mt-2">Try: "Find me some React jobs" or "Explain my profile points"</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`message-bubble ${msg.role}`}>
                        {msg.text}
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="message-bubble agent flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Thinking...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <div className="p-4">
                  <h4 className="text-sm font-semibold mb-3 border-b border-gray-700 pb-1">Task History</h4>
                  {history.length === 0 ? (
                    <p className="text-xs text-gray-500">No previous tasks yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {history.map((item, idx) => (
                        <div key={idx} className="history-item">
                          <p className="text-xs font-medium text-blue-400">Task: {item.task}</p>
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{item.response}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            {view === 'chat' && (
              <form onSubmit={handleSend} className="ai-agent-footer">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="ai-agent-input"
                />
                <button type="submit" disabled={loading} className="ai-agent-send">
                  <Send size={18} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAgent;

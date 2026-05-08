import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronUp, ChevronDown, Search, MoreHorizontal, Send, Image as ImageIcon, Smile, Users, UserPlus, Video } from 'lucide-react';
import { ChatState } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useCall } from '../context/CallContext';
import axios from 'axios';

const MessagingDrawer = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { callUser } = useCall();
  const { selectedChat, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatWindow, setActiveChatWindow] = useState(null);

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const messageEndRef = useRef(null);
  let selectedChatCompare = activeChatWindow;

  useEffect(() => {
    if (!socket) return;
    setSocketConnected(true);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop_typing", () => setIsTyping(false));
  }, [socket]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get("chats");
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats", error);
      }
    };
    fetchChats();
  }, [user, setChats]);

  useEffect(() => {
    if (!socket) return;
    
    const messageHandler = (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        setNotification(prev => {
          if (!prev.find(n => n._id === newMessageReceived._id)) {
            return [newMessageReceived, ...prev];
          }
          return prev;
        });
      } else {
        setMessages(prev => [...prev, newMessageReceived]);
      }
      
      setChats(prevChats => prevChats.map(c => 
        c._id === newMessageReceived.chat._id ? {...c, latestMessage: newMessageReceived} : c
      ));
    };

    socket.on("message_received", messageHandler);
    return () => socket.off("message_received", messageHandler);
  }, [socket]);


  useEffect(() => {
    const toggleHandler = () => {
      setIsOpen(prev => !prev);
      if (!isOpen) setIsExpanded(true);
    };
    window.addEventListener('toggle-messaging', toggleHandler);
    return () => window.removeEventListener('toggle-messaging', toggleHandler);
  }, [isOpen]);

  const fetchMessages = async () => {
    if (!activeChatWindow) return;
    try {
      const { data } = await axios.get(`messages/${activeChatWindow._id}`);
      setMessages(data);
      socket.emit("join_chat", activeChatWindow._id);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = activeChatWindow;
  }, [activeChatWindow]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      const { data } = await axios.get(`users/search?q=${query}`);
      setSearchResult(data);
    } catch (error) {
      console.error("Error searching users", error);
    }
  };

  const accessOrCreateChat = async (userId) => {
    try {
      const { data } = await axios.post("chats", { userId });
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setActiveChatWindow(data);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      console.error("Error accessing chat", error);
    }
  };

  const createGroup = async () => {
    if (!groupChatName || selectedUsers.length < 2) return;
    try {
      const { data } = await axios.post("chats/group", {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      });
      setChats([data, ...chats]);
      setIsGroupModalOpen(false);
      setActiveChatWindow(data);
      setSelectedUsers([]);
      setGroupChatName("");
    } catch (error) {
      console.error("Error creating group chat", error);
    }
  };

  const sendMessage = async (event) => {
    if ((event.type === 'keydown' && event.key === "Enter") || event.type === 'click') {
      if (newMessage.trim()) {
        socket.emit("stop_typing", activeChatWindow._id);
        try {
          const { data } = await axios.post("messages", {
            content: newMessage,
            chatId: activeChatWindow._id,
          });
          setNewMessage("");
          socket.emit("new_message", data);
          setMessages([...messages, data]);
          setChats(prevChats => prevChats.map(c => c._id === activeChatWindow._id ? {...c, latestMessage: data} : c));
        } catch (error) {
          console.error("Error sending message", error);
        }
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", activeChatWindow._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop_typing", activeChatWindow._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const getChatName = (chat) => {
    if (!chat) return "";
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find(u => u._id !== user?._id);
    return otherUser ? otherUser.name || otherUser.username : "Unknown User";
  };

  const getChatImage = (chat) => {
    if (!chat) return "";
    if (chat.isGroupChat) return `https://api.dicebear.com/7.x/initials/svg?seed=${chat.chatName}`;
    const otherUser = chat.users.find(u => u._id !== user?._id);
    return otherUser?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username}`;
  };

  const isUserOnline = (chat) => {
      if (chat.isGroupChat) return false;
      const otherUser = chat.users.find(u => u._id !== user?._id);
      return onlineUsers.includes(otherUser?._id);
  }

  if (!user || !isOpen) return null;

  return (

    <div className="messaging-drawer-container" style={{ position: 'fixed', bottom: 0, right: '20px', zIndex: 1000, display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
      
      {/* Messaging Bar / List */}
      <motion.div 
        initial={false}
        animate={{ height: isExpanded ? '500px' : '48px', width: '300px' }}
        className="messaging-list-window"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px 8px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <div 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: '0 12px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                    <img src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#057642', borderRadius: '50%', border: '2px solid white' }}></div>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Messaging</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <UserPlus size={18} color="var(--text-light)" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setIsGroupModalOpen(true); }} />
                {isExpanded ? <ChevronDown size={18} color="var(--text-light)" /> : <ChevronUp size={18} color="var(--text-light)" />}
            </div>
        </div>

        {isExpanded && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '8px' }}>
                    <div style={{ background: 'var(--bg)', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px', border: '1px solid var(--border)', position: 'relative' }}>
                        <Search size={16} color="var(--text-light)" />
                        <input 
                            type="text" 
                            placeholder="Search messages or people" 
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ border: 'none', background: 'transparent', padding: '8px', fontSize: '0.85rem', outline: 'none', width: '100%' }} 
                        />
                        {searchResult.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid var(--border)', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                {searchResult.map(u => (
                                    <div key={u._id} onClick={() => accessOrCreateChat(u._id)} style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)' }}>
                                        <img src={u.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} style={{ width: '30px', height: '30px', borderRadius: '50%' }} alt="" />
                                        <span style={{ fontSize: '0.85rem' }}>{u.name || u.username}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {chats.map(chat => (
                    <div 
                        key={chat._id} 
                        onClick={() => setActiveChatWindow(chat)}
                        className="chat-list-item"
                        style={{ padding: '12px', display: 'flex', gap: '12px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', background: activeChatWindow?._id === chat._id ? 'rgba(0,0,0,0.05)' : 'transparent' }}
                    >
                        <div style={{ position: 'relative' }}>
                            <img src={getChatImage(chat)} style={{ width: '48px', height: '48px', borderRadius: '50%' }} alt="" />
                            {isUserOnline(chat) && (
                                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', background: '#057642', borderRadius: '50%', border: '2px solid white' }}></div>
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getChatName(chat)}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                    {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleDateString() : ''}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {chat.latestMessage ? `${chat.latestMessage.sender.name || chat.latestMessage.sender.username}: ${chat.latestMessage.content}` : 'No messages yet'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </motion.div>

      {/* Group Chat Modal */}
      <AnimatePresence>
        {isGroupModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0 }}>Create Group Chat</h3>
                        <X style={{ cursor: 'pointer' }} onClick={() => setIsGroupModalOpen(false)} />
                    </div>
                    <input type="text" placeholder="Group Name" value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="text" placeholder="Add Users (eg: John, Jane)" onChange={(e) => handleSearch(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {selectedUsers.map(u => (
                            <div key={u._id} style={{ background: '#0a66c2', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {u.name || u.username}
                                <X size={14} style={{ cursor: 'pointer' }} onClick={() => setSelectedUsers(selectedUsers.filter(sel => sel._id !== u._id))} />
                            </div>
                        ))}
                    </div>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {searchResult.map(u => (
                            <div key={u._id} onClick={() => setSelectedUsers([...selectedUsers, u])} style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee' }}>
                                <img src={u.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} style={{ width: '25px', height: '25px', borderRadius: '50%' }} alt="" />
                                <span>{u.name || u.username}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={createGroup} style={{ background: '#0a66c2', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Create Group</button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Active Chat Window */}
      <AnimatePresence>
        {activeChatWindow && (
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="active-chat-window"
                style={{ width: '350px', height: '450px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px 8px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ padding: '0 12px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <img src={getChatImage(activeChatWindow)} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                            {isUserOnline(activeChatWindow) && (
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#057642', borderRadius: '50%', border: '2px solid white' }}></div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{getChatName(activeChatWindow)}</span>
                            {isUserOnline(activeChatWindow) && <span style={{ fontSize: '0.7rem', color: '#057642' }}>Online</span>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {!activeChatWindow.isGroupChat && (
                            <Video 
                                size={18} 
                                color="var(--primary)" 
                                style={{ cursor: 'pointer' }} 
                                onClick={() => {
                                    const otherUser = activeChatWindow.users.find(u => u._id !== user?._id);
                                    callUser(otherUser?._id);
                                }} 
                            />
                        )}
                        <MoreHorizontal size={18} color="var(--text-light)" style={{ cursor: 'pointer' }} />
                        <X size={18} color="var(--text-light)" style={{ cursor: 'pointer' }} onClick={() => setActiveChatWindow(null)} />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {messages.map((m, i) => (
                        <div key={m._id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender._id === user._id ? 'flex-end' : 'flex-start' }}>
                            { (i === 0 || messages[i-1].sender._id !== m.sender._id) && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                                    {m.sender.name || m.sender.username}
                                </span>
                            )}
                            <div style={{ 
                                maxWidth: '80%', 
                                padding: '8px 12px', 
                                borderRadius: '12px', 
                                background: m.sender._id === user._id ? '#0a66c2' : '#f3f3f3', 
                                color: m.sender._id === user._id ? 'white' : 'black',
                                fontSize: '0.9rem'
                            }}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: 'flex', gap: '4px', padding: '8px' }}>
                            <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%' }}></div>
                            <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%' }}></div>
                            <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%' }}></div>
                        </div>
                    )}
                    <div ref={messageEndRef} />
                </div>

                <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                        <textarea 
                            value={newMessage}
                            onChange={typingHandler}
                            onKeyDown={sendMessage}
                            placeholder="Write a message..."
                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '12px', fontSize: '0.9rem', outline: 'none', resize: 'none', minHeight: '60px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderTop: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <ImageIcon size={20} color="var(--text-light)" style={{ cursor: 'pointer' }} />
                                <Smile size={20} color="var(--text-light)" style={{ cursor: 'pointer' }} />
                            </div>
                            <button 
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                style={{ 
                                    background: newMessage.trim() ? '#0a66c2' : '#ccc', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '16px', 
                                    padding: '4px 16px', 
                                    fontWeight: 600, 
                                    cursor: newMessage.trim() ? 'pointer' : 'default' 
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .chat-list-item:hover { background: rgba(0,0,0,0.05) !important; }
        .typing-dot { animation: typingAnimation 1.4s infinite ease-in-out both; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typingAnimation {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
};

export default MessagingDrawer;

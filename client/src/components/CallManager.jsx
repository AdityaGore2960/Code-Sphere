import React from 'react';
import { useCall } from '../context/CallContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';

const CallManager = () => {
  const { call, callAccepted, myVideoRef, userVideoRef, callEnded, leaveCall, answerCall, setCall } = useCall();

  return (
    <>
      {/* Incoming Call Notification */}
      <AnimatePresence>
        {call.isReceivingCall && !callAccepted && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 5000, width: '100%', maxWidth: '400px' }}
          >
            <div className="card" style={{ padding: '1.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video color="white" />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>Incoming Interview Call</p>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{call.name}</h4>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setCall({})} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneOff size={20} />
                </button>
                <button onClick={answerCall} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
                  <Phone size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Overlay */}
      <AnimatePresence>
        {callAccepted && !callEnded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 4000, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '8px' }}>
                  <Video size={20} color="white" />
                </div>
                <h3 style={{ color: 'white', fontWeight: 700 }}>Collaboration Session: {call.name || 'User'}</h3>
              </div>
              <button onClick={leaveCall} className="btn" style={{ background: '#ef4444', color: 'white' }}>End Session</button>
            </div>

            {/* Video Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
              <div style={{ position: 'relative', background: '#1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
                <video playsInline muted ref={myVideoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', bottom: '1rem', left: '1rem', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>You</span>
              </div>
              <div style={{ position: 'relative', background: '#1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
                <video playsInline ref={userVideoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', bottom: '1rem', left: '1rem', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>{call.name}</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              <button style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={24} />
              </button>
              <button style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={24} />
              </button>
              <button onClick={leaveCall} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneOff size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </>
  );
};

export default CallManager;

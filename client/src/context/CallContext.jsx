import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Peer from 'simple-peer';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [myVideo, setMyVideo] = useState();
  const [userVideo, setUserVideo] = useState();
  const [connectionRef, setConnectionRef] = useState();

  const myVideoRef = useRef();
  const userVideoRef = useRef();

  useEffect(() => {
    if (socket) {
      socket.on('callUser', ({ from, name: callerName, signal }) => {
        setCall({ isReceivingCall: true, from, name: callerName, signal });
      });

      socket.on('callEnded', () => {
        leaveCall();
      });
    }
  }, [socket]);

  const answerCall = () => {
    setCallAccepted(true);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = currentStream;

        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
          socket.emit('answerCall', { signal: data, to: call.from });
        });

        peer.on('stream', (remoteStream) => {
          if (userVideoRef.current) userVideoRef.current.srcObject = remoteStream;
        });

        peer.signal(call.signal);

        setConnectionRef(peer);
      });
  };

  const callUser = (id) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = currentStream;

        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
          socket.emit('callUser', {
            userToCall: id,
            signalData: data,
            from: user._id,
            name: user.username,
          });
        });

        peer.on('stream', (remoteStream) => {
          if (userVideoRef.current) userVideoRef.current.srcObject = remoteStream;
        });

        socket.on('callAccepted', (signal) => {
          setCallAccepted(true);
          peer.signal(signal);
        });

        setConnectionRef(peer);
      });
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef) connectionRef.destroy();
    window.location.reload(); // Refresh to clear streams easily
  };

  return (
    <CallContext.Provider value={{
      call,
      callAccepted,
      myVideoRef,
      userVideoRef,
      stream,
      name,
      setName,
      callEnded,
      myVideo,
      userVideo,
      callUser,
      leaveCall,
      answerCall,
      setCall
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);

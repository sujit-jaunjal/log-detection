import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(onEvent) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io('http://localhost:4000');
    setSocket(s);
    if (onEvent) {
      s.onAny((event, ...args) => onEvent(event, ...args));
    }
    return () => {
      s.disconnect();
    };
  }, [onEvent]);

  return socket;
} 
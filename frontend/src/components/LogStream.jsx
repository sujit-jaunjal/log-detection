import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

export default function LogStream({ socket }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const handler = (newLogs) => setLogs((prev) => [...newLogs, ...prev].slice(0, 100));
    socket.on('new-logs', handler);
    return () => socket.off('new-logs', handler);
  }, [socket]);

  if (!socket) return <div>Connecting to log stream...</div>;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Live Log Stream</Typography>
      <List dense>
        {logs.map((log, idx) => (
          <ListItem key={idx} divider>
            <ListItemText
              primary={log.raw}
              secondary={`IP: ${log.ip} | Status: ${log.status} | Path: ${log.path}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 
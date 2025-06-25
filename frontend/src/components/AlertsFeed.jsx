import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

export default function AlertsFeed({ socket }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const handler = (newAlerts) => setAlerts((prev) => [...newAlerts, ...prev].slice(0, 100));
    socket.on('alerts', handler);
    return () => socket.off('alerts', handler);
  }, [socket]);

  if (!socket) return <div>Connecting to alerts feed...</div>;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Real-Time Alerts</Typography>
      <List dense>
        {alerts.map((alert, idx) => (
          <ListItem key={idx} divider>
            <ListItemText
              primary={`${alert.ruleName} [${alert.priority}]`}
              secondary={
                <>
                  <div>{alert.trigger}</div>
                  <div>{alert.timestamp}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{alert.log?.raw}</div>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 
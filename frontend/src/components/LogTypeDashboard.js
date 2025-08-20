import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { io } from 'socket.io-client';

const LogTypeDashboard = () => {
  const [logTypes, setLogTypes] = useState({
    apache: { count: 0, lastUpdated: null },
    windows: { count: 0, lastUpdated: null }
  });

  useEffect(() => {
    const socket = io('http://localhost:4000');
    
    socket.on('new-logs', (logs) => {
      const updatedTypes = { ...logTypes };
      
      logs.forEach(log => {
        if (log.source === 'apache') {
          updatedTypes.apache.count += 1;
          updatedTypes.apache.lastUpdated = new Date().toLocaleTimeString();
        } else if (log.source === 'windows') {
          updatedTypes.windows.count += 1;
          updatedTypes.windows.lastUpdated = new Date().toLocaleTimeString();
        }
      });

      setLogTypes(updatedTypes);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Log Type Monitoring
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Typography variant="h5" component="div">
              Apache Logs
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`Count: ${logTypes.apache.count}`} 
                color="primary" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Last: ${logTypes.apache.lastUpdated || 'N/A'}`} 
                variant="outlined" 
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Typography variant="h5" component="div">
              Windows Logs
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`Count: ${logTypes.windows.count}`} 
                color="secondary" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Last: ${logTypes.windows.lastUpdated || 'N/A'}`} 
                variant="outlined" 
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LogTypeDashboard;
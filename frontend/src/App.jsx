import React from 'react';
import Layout from './components/Layout';
import AlertsFeed from './components/AlertsFeed';
import LogStream from './components/LogStream';
import RuleManager from './components/RuleManager';
import useSocket from './hooks/useSocket';

function App() {
  const socket = useSocket();

  return (
    <Layout>
      <AlertsFeed socket={socket} />
      <LogStream socket={socket} />
      <RuleManager />
    </Layout>
  );
}

export default App; 
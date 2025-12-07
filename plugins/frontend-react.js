const path = require('path');
const { runCommand } = require('../lib/utils');

module.exports = {
    name: 'Frontend (React + MUI)',
    generate: async (targetDir) => {
        const frontendDir = path.join(targetDir, 'frontend');

        console.log('Scaffolding React Frontend...');

        // We use 'create-vite' to generate the project.
        // pass --template react to create-vite
        // The command needs to be run in the targetDir

        // Create the directory first? create-vite creates it.
        // We'll run create-vite content in 'frontend' folder relative to targetDir.

        // Note: create-vite might prompt if we don't pass arguments correctly or if dir exists.
        // We use 'npm create vite@latest frontend -- --template react'

        // However, we are running automated. "npm create vite@latest" might require interactive confirmation if package not installed.
        // using "npx -y create-vite@latest frontend --template react" is safer.

        await runCommand('npx -y create-vite@latest frontend --template react', targetDir);

        console.log('Installing dependencies including MUI...');

        // Install basic dependencies
        await runCommand('npm install', frontendDir);

        // Install MUI
        // @mui/material @emotion/react @emotion/styled
        await runCommand('npm install @mui/material @emotion/react @emotion/styled', frontendDir);

        // Overwrite App.jsx with Health Check UI
        const fs = require('fs');
        const appJsxPath = path.join(frontendDir, 'src', 'App.jsx');
        const appJsxContent = `
import React, { useState } from 'react';
import { Button, Container, Typography, Box, Snackbar, Alert } from '@mui/material';

function App() {
  const [status, setStatus] = useState('neutral'); // neutral, success, error
  const [open, setOpen] = useState(false);

  const checkHealth = async () => {
    try {
      // Use VITE_API_URL or fallback to localhost:3000
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(\`\${apiUrl}/healthcheck\`);
      const data = await response.json();

      if (response.status === 200 && data.success === true) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus('error');
    }
    setOpen(true);
  };

  const handleClose = () => {
    // Keep the status color but close the snackbar
    setOpen(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        App Health Check
      </Typography>
      
      <Box sx={{ 
        p: 4, 
        border: '1px solid #ccc', 
        borderRadius: 2,
        bgcolor: status === 'success' ? '#e8f5e9' : status === 'error' ? '#ffebee' : 'transparent',
        transition: 'background-color 0.3s'
      }}>
        <Typography variant="body1" paragraph>
          Backend URL: {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
        </Typography>

        <Button 
          variant="contained" 
          color={status === 'success' ? 'success' : status === 'error' ? 'error' : 'primary'}
          onClick={checkHealth}
          size="large"
        >
          Check Backend Health
        </Button>
      </Box>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={status === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
          {status === 'success' ? 'Backend is healthy!' : 'Backend connection failed!'}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
`;
        fs.writeFileSync(appJsxPath, appJsxContent, 'utf8');

        console.log('Frontend setup complete.');
    }
};

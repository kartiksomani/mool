const path = require('path');
const fs = require('fs');
const { runCommand, createFile } = require('../lib/utils');

const ensureEnvValue = (filePath, key, value) => {
  const entry = `${key}=${value}`;
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${entry}\n`, 'utf8');
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const pattern = new RegExp(`^${key}=`, 'm');
  if (!pattern.test(content)) {
    const needsNewline = content.endsWith('\n') ? '' : '\n';
    fs.appendFileSync(filePath, `${needsNewline}${entry}`);
  }
};

module.exports = {
  name: 'Authentication (Google OAuth)',
  priority: 20,
  generate: async (targetDir) => {
    const frontendDir = path.join(targetDir, 'frontend');
    const backendDir = path.join(targetDir, 'backend');

    console.log('Adding Authentication (Frontend)...');

    // 1. Install Frontend Dependencies
    await runCommand('npm install react-router-dom @react-oauth/google jwt-decode', frontendDir);

    // 2. Ensure required OAuth env vars exist for local debug & production builds
    ensureEnvValue(path.join(frontendDir, '.env.development'), 'VITE_GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID_HERE');
    ensureEnvValue(path.join(frontendDir, '.env.production'), 'VITE_GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID_HERE');

    const backendEnvPath = path.join(backendDir, '.env');
    ensureEnvValue(backendEnvPath, 'GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID_HERE');
    ensureEnvValue(backendEnvPath, 'CORS_ORIGIN', 'http://localhost:5173');

    // 3. Create Frontend Components
    // Login.jsx
    const loginPageContent = `
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';

function Login() {
  const navigate = useNavigate();
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

  const handleSuccess = (credentialResponse) => {
    // Save token to localStorage
    localStorage.setItem('token', credentialResponse.credential);
    console.log('Login Success:', credentialResponse);
    navigate('/private');
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  if (skipAuth) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Authentication Disabled</Typography>
        <Typography variant="body1">
          Restart the dev runner without --skip-auth to test Google login flows.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </Box>
    </Container>
  );
}

export default Login;
`;
    createFile(path.join(frontendDir, 'src/pages/Login.jsx'), loginPageContent);

    // Private.jsx
    const privatePageContent = `
import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Private() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    if (skipAuth) {
      fetch(apiUrl + '/protected-data')
        .then(res => res.json())
        .then(payload => setData(payload))
        .catch(err => console.error(err));
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Call protected endpoint
    fetch(apiUrl + '/protected-data', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res => {
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        throw new Error('Unauthorized');
      }
      return res.json();
    })
    .then(data => setData(data))
    .catch(err => console.error(err));
  }, [navigate, skipAuth]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Typography variant="h4" gutterBottom>Private Page</Typography>
      <Typography variant="body1" paragraph>
        {skipAuth ? 'This page is protected. Running with auth disabled for local development.' : 'This page is protected. If you see this, you are logged in.'}
      </Typography>
      
      {data && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Backend Message:</Typography>
          <Typography variant="body1">{data.message}</Typography>
          <Typography variant="body2" color="textSecondary">User ID: {data.user}</Typography>
        </Paper>
      )}

      <Button variant="outlined" color="secondary" onClick={logout}>Logout</Button>
    </Container>
  );
}

export default Private;
`;

    createFile(path.join(frontendDir, 'src/pages/Private.jsx'), privatePageContent);

    // Home.jsx (Modified from original App)
    // We'll rename App.jsx logic to Home.jsx or just recreate a simple Home.jsx
    // Let's create a new Home.jsx that links to Login and Health Check
    const homePageContent = `
import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>Welcome</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
        <Button variant="outlined" onClick={() => navigate('/app-health')}>
          Check Health
        </Button>
      </Box>
    </Container>
  );
}

export default Home;
`;
    createFile(path.join(frontendDir, 'src/pages/Home.jsx'), homePageContent);

    // 4. Overwrite App.jsx to handle Routing
    const appRouterContent = `
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Container, Typography, Paper } from '@mui/material';
import Home from './pages/Home';
import Login from './pages/Login';
import Private from './pages/Private';
import HealthCheckApp from './HealthCheckApp'; // we will rename the original App to this

function MissingOAuthConfig() {
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Google OAuth not configured</Typography>
        <Typography variant="body1" paragraph>
          Set VITE_GOOGLE_CLIENT_ID inside frontend/.env.development to test login locally.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          For production builds update frontend/.env.production and backend/.env with the same value.
        </Typography>
      </Paper>
    </Container>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/private" element={<Private />} />
        <Route path="/app-health" element={<HealthCheckApp />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

  if (!clientId && !skipAuth) {
    return <MissingOAuthConfig />;
  }

  const routes = <AppRoutes />;

  if (skipAuth) {
    return routes;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {routes}
    </GoogleOAuthProvider>
  );
}

export default App;
`;

    // Move original App.jsx to HealthCheckApp.jsx so we don't lose the health check feature
    const oldAppPath = path.join(frontendDir, 'src/App.jsx');
    const newHealthAppPath = path.join(frontendDir, 'src/HealthCheckApp.jsx');
    if (fs.existsSync(oldAppPath)) {
      // We need to rename the component execution function name from App to HealthCheckApp inside the file? 
      // Or just import as is. The default export allows renaming.
      // But if it's "function App()", React DevTools will show "App". Not a big deal.
      fs.renameSync(oldAppPath, newHealthAppPath);
    }

    createFile(path.join(frontendDir, 'src/App.jsx'), appRouterContent);


    console.log('Adding Authentication (Backend)...');

    // 1. Install Backend Dependencies
    await runCommand('npm install google-auth-library', backendDir);

    // 2. Inject Code into index.js
    const indexJsPath = path.join(backendDir, 'index.js');
    let indexJsContent = fs.readFileSync(indexJsPath, 'utf8');

    // Inject Imports
    const imports = `
const { OAuth2Client } = require('google-auth-library');
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const skipAuth = process.env.SKIP_AUTH === 'true';

if (!googleClientId && !skipAuth) {
  console.warn('Google OAuth client ID is not configured. Set GOOGLE_CLIENT_ID in backend/.env to enable local testing.');
}

if (skipAuth) {
  console.warn('SKIP_AUTH is enabled. Authentication middleware will be bypassed. Do not use this flag in production.');
}

const client = googleClientId ? new OAuth2Client(googleClientId) : null;
`;

    indexJsContent = indexJsContent.replace('/* IMPORTS */', imports);

    // Inject Middleware (Auth Check)
    const middleware = `
const verifyToken = async (req, res, next) => {
  if (skipAuth) {
    req.user = req.user || { sub: 'dev-user', email: 'dev@example.com' };
    return next();
  }

  if (!googleClientId || !client) {
    return res.status(503).json({ error: 'Google OAuth is not configured on the server.' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
`;

    indexJsContent = indexJsContent.replace('/* MIDDLEWARE */', middleware);

    // Inject Routes
    const routes = `
app.get('/protected-data', verifyToken, (req, res) => {
  res.json({ 
    message: 'This is protected data only visible to logged in users.',
    user: req.user.sub,
    email: req.user.email
  });
});
`;
    indexJsContent = indexJsContent.replace('/* ROUTES */', routes);

    fs.writeFileSync(indexJsPath, indexJsContent);

    console.log('Authentication setup complete.');
  }
};

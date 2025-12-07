const { createFile } = require('../lib/utils');
const path = require('path');

module.exports = {
    name: 'Dev Runner Script',
    generate: async (targetDir) => {
        console.log('Generating dev runner script...');

        // Content of the start-dev.js script
        const scriptContent = `
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

// Helper to find an available port
function getAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(getAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
}

function runCommand(command, args, cwd, env = {}) {
    const child = spawn(command, args, {
        cwd,
        shell: true,
        stdio: 'inherit',
        env: { ...process.env, ...env }
    });
    
    child.on('error', (err) => {
        console.error(\`Failed to start command: \${command} \${args.join(' ')}\`, err);
    });
    
    return child;
}

async function start() {
    try {
        const backendPort = await getAvailablePort(3000);
        const frontendPort = await getAvailablePort(5173); // Default Vite port, but finding next available
        
        console.log(\`Starting Middleware/Backend on port \${backendPort}...\`);
        console.log(\`Starting Frontend on port \${frontendPort}...\`);

        // Start Backend
        const backendDir = path.join(__dirname, 'backend');
        const backendProcess = runCommand('npm', ['run', 'dev'], backendDir, { 
            PORT: backendPort 
        });

        // Start Frontend
        const frontendDir = path.join(__dirname, 'frontend');
        // Vite expects --port to be passed strictly
        const frontendProcess = runCommand('npm', ['run', 'dev', '--', '--port', frontendPort], frontendDir, {
            VITE_API_PORT: backendPort,
            VITE_API_URL: \`http://localhost:\${backendPort}\`
        });
        
        const cleanup = () => {
            console.log('\\nStopping processes...');
            backendProcess.kill();
            frontendProcess.kill();
            process.exit();
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (err) {
        console.error('Error starting server:', err);
    }
}

start();
`;

        createFile(path.join(targetDir, 'start-dev.js'), scriptContent);
        console.log('Created start-dev.js in project root.');
    }
};

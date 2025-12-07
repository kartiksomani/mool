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

        console.log('Frontend setup complete.');
    }
};

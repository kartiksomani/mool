const path = require('path');
const { runCommand, createFile } = require('../lib/utils');

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

    const fs = require('fs');

    // Generate .env files for Debug/Release modes
    const envDevContent = `VITE_API_URL=http://localhost:3000`;
    const envProdContent = `VITE_API_URL=https://api.example.com`;

    fs.writeFileSync(path.join(frontendDir, '.env.development'), envDevContent);
    fs.writeFileSync(path.join(frontendDir, '.env.production'), envProdContent);

    // Read App.jsx template
    const templatePath = path.join(__dirname, '../templates/frontend/App.jsx.template');
    const appJsxContent = fs.readFileSync(templatePath, 'utf8');

    // Write to src/App.jsx
    const appJsxPath = path.join(frontendDir, 'src', 'App.jsx');
    fs.writeFileSync(appJsxPath, appJsxContent, 'utf8');

    console.log('Frontend setup complete.');
  }
};

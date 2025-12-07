const path = require('path');
const fs = require('fs');
const { runCommand, ensureDir, createFile } = require('../lib/utils');

module.exports = {
  name: 'Backend (Express.js)',
  generate: async (targetDir) => {
    const backendDir = path.join(targetDir, 'backend');
    ensureDir(backendDir);

    console.log('Scaffolding Express Backend...');

    // Initialize npm
    await runCommand('npm init -y', backendDir);

    // Install dependencies
    console.log('Installing backend dependencies...');
    await runCommand('npm install express cors dotenv', backendDir);
    await runCommand('npm install -D nodemon', backendDir);

    // Create index.js
    const templatePath = path.join(__dirname, '../templates/backend/index.js.template');
    const indexJsContent = fs.readFileSync(templatePath, 'utf8');
    createFile(path.join(backendDir, 'index.js'), indexJsContent);

    // Update package.json to add start scripts
    // We need to read, modify, and write package.json
    const packageJsonPath = path.join(backendDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.scripts = {
        ...packageJson.scripts,
        start: 'node index.js',
        dev: 'nodemon index.js'
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    console.log('Backend setup complete.');
  }
};

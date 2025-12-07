const path = require('path');
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
        const indexJsContent = `require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express Backend!');
});

app.listen(port, () => {
  console.log(\`Server is running on http://localhost:\${port}\`);
});
`;
        createFile(path.join(backendDir, 'index.js'), indexJsContent);

        // Update package.json to add start scripts
        // We need to read, modify, and write package.json
        const fs = require('fs');
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

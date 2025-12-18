const fs = require('fs');
const path = require('path');
const { createFile } = require('../lib/utils');

module.exports = {
    name: 'Dev Runner Script',
    generate: async (targetDir) => {
        console.log('Generating dev runner script...');

        const templatePath = path.join(__dirname, '..', 'templates', 'start-dev.js.template');
        const scriptContent = fs.readFileSync(templatePath, 'utf8');

        createFile(path.join(targetDir, 'start-dev.js'), scriptContent);
        console.log('Created start-dev.js in project root.');
    }
};

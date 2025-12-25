const { createFile } = require('../lib/utils');
const path = require('path');

module.exports = {
    name: 'Documentation',
    generate: async (targetDir) => {
        console.log('Generating README...');

        const readmeContent = `# Project Name

This project consists of a React frontend and an Express backend.

## Structure

- **frontend/**: React application with Material UI.
- **backend/**: Express.js API.

## Getting Started

### Development (Debug Mode)

You can run both frontend and backend using the dev runner script:

\`\`\`bash
node start-dev.js
# Optional: bypass Google login during local development
node start-dev.js --skip-auth
\`\`\`

This will start:
- Backend on port 3000 (or next available).
- Frontend on port 5173 (or next available).

**Configuration:**
The frontend uses \`.env.development\` for configuration in this mode.
Default: \`VITE_API_URL=http://localhost:3000\`
When using \`--skip-auth\`, both servers run without Google OAuth enforcement so you can focus on UI changes.

### Production (Release Mode)

To build the frontend for production:

\`\`\`bash
cd frontend
npm run build
\`\`\`

**Configuration:**
The frontend uses \`.env.production\` for configuration during build.
Default: \`VITE_API_URL=https://api.example.com\`

UPDATE THIS URL in \`frontend/.env.production\` to point to your actual production backend URL before building.

## Health Check

The app includes a health check feature.
- Backend endpoint: \`/healthcheck\`
- Frontend UI: Click "Check Backend Health" in the main app.
`;

        createFile(path.join(targetDir, 'README.md'), readmeContent);
        console.log('README generated.');
    }
};

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Executes a shell command in a specific directory.
 * @param {string} command - The command to run.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<string>} - The stdout output.
 */
async function runCommand(command, cwd = process.cwd()) {
    try {
        console.log(`Executing: ${command} in ${cwd}`);
        const { stdout, stderr } = await execPromise(command, { cwd });
        if (stderr) {
            console.warn(`Warning: ${stderr}`);
        }
        return stdout;
    } catch (error) {
        console.error(`Error executing command: ${command}`, error);
        throw error;
    }
}

/**
 * Ensures that a directory exists.
 * @param {string} dirPath - The directory path.
 */
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

/**
 * Creates a file with the given content.
 * @param {string} filePath - Path to the file.
 * @param {string} content - Content to write.
 */
function createFile(filePath, content) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created file: ${filePath}`);
}

module.exports = {
    runCommand,
    ensureDir,
    createFile
};

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ensureDir } = require('./lib/utils');

// Parse arguments
const args = process.argv.slice(2);
let outputDir = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir') {
        outputDir = args[i + 1];
        i++;
    }
}

if (!outputDir) {
    console.error('Error: --output-dir argument is required');
    console.log('Usage: node generate_project.js --output-dir <path>');
    process.exit(1);
}

// Resolve absolute path
const targetDir = path.resolve(process.cwd(), outputDir);
console.log(`Generating project in: ${targetDir}`);

ensureDir(targetDir);

// Plugin system: Load all plugins from plugins/ directory
const pluginsDir = path.join(__dirname, 'plugins');
let plugins = [];

if (fs.existsSync(pluginsDir)) {
    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith('.js')) {
            const plugin = require(path.join(pluginsDir, file));
            plugins.push(plugin);
        }
    });
} else {
    console.warn('No plugins directory found!');
}

// Sort plugins by priority (default 50)
plugins.sort((a, b) => {
    const priorityA = a.priority || 50;
    const priorityB = b.priority || 50;
    return priorityA - priorityB;
});

async function runModules() {
    for (const plugin of plugins) {
        if (typeof plugin.generate === 'function') {
            console.log(`\nRunning plugin: ${plugin.name || 'unnamed'}...`);
            try {
                await plugin.generate(targetDir);
                console.log(`Plugin ${plugin.name} completed successfully.`);
            } catch (err) {
                console.error(`Plugin ${plugin.name} failed:`, err);
            }
        }
    }
    console.log('\nProject generation completed!');
}

runModules();

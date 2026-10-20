// Entry point for CWP (Control Web Panel) NodeJS Manager & Passenger
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const serverBundle = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(serverBundle)) {
  console.error('================================================================');
  console.error('MUBSREC Server Start Error: dist/server.cjs not found!');
  console.error('Please run:');
  console.error('  npm install');
  console.error('  npm run build');
  console.error('in the terminal to compile the application before starting.');
  console.error('================================================================');
  process.exit(1);
}

try {
  require(serverBundle);
} catch (err) {
  console.error('Error starting MUBSREC Assistant server:', err);
  process.exit(1);
}


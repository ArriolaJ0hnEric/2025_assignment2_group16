const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distPath = path.join(__dirname, '../blogList-backend/dist');

if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}

execSync('npm run build', { cwd: path.join(__dirname, '../bloglist-frontend'), stdio: 'inherit' });

fs.cpSync(
  path.join(__dirname, '../bloglist-frontend/dist'),
  distPath,
  { recursive: true }
);
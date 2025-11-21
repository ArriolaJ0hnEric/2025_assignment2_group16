const fs = require('fs')
const path = require('path')

const backendSrc = path.join(__dirname, '../blogList-backend')
const frontendDist = path.join(__dirname, '../bloglist-frontend/dist')
const buildDir = path.join(__dirname, '../build')
const backendBuildDir = path.join(buildDir, 'backend')
const frontendBuildDir = path.join(buildDir, 'dist')

function copyFolderSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true })
}
fs.mkdirSync(buildDir, { recursive: true })

fs.mkdirSync(backendBuildDir, { recursive: true })
fs.copyFileSync(
  path.join(backendSrc, 'package.json'),
  path.join(backendBuildDir, 'package.json')
);

const srcDir = path.join(backendSrc, 'src')
const entries = fs.readdirSync(srcDir, { withFileTypes: true })

entries.forEach(entry => {
  const srcPath = path.join(srcDir, entry.name)
  const destPath = path.join(backendBuildDir, entry.name)

  if (entry.isDirectory()) {
    copyFolderSync(srcPath, destPath)
  } else {
    fs.copyFileSync(srcPath, destPath)
  }
});

if (fs.existsSync(frontendDist)) {
  copyFolderSync(frontendDist, frontendBuildDir)
}

console.log("Build folder created")

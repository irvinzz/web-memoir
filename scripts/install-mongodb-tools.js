const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const platform = os.platform();
const arch = os.arch();
const installDir = path.join('resources', 'mongodb-tools');
const version = '100.15.0';

let url, ext, archiveName;

if (platform === 'linux') {
  archiveName = `mongodb-database-tools-ubuntu2204-x86_64-${version}.tgz`;
  url = `https://fastdl.mongodb.org/tools/db/${archiveName}`;
  ext = 'tgz';
} else if (platform === 'darwin') {
  if (arch === 'arm64') {
    archiveName = `mongodb-database-tools-macos-arm64-${version}.zip`;
  } else {
    archiveName = `mongodb-database-tools-macos-x86_64-${version}.zip`;
  }
  url = `https://fastdl.mongodb.org/tools/db/${archiveName}`;
  ext = 'zip';
} else if (platform === 'win32') {
  archiveName = `mongodb-database-tools-windows-x86_64-${version}.zip`;
  url = `https://fastdl.mongodb.org/tools/db/${archiveName}`;
  ext = 'zip';
} else {
  console.error('Unsupported platform');
  process.exit(1);
}

fs.mkdirSync(installDir, { recursive: true });
const archivePath = path.join(installDir, archiveName);

(async () => {
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(archivePath, Buffer.from(buffer));

    if (ext === 'tgz') {
      execSync(`tar -xzf "${archivePath}" -C "${installDir}" --strip-components=1`);
    } else {
      execSync(`unzip -q "${archivePath}" -d "${installDir}"`);
      const folder = fs.readdirSync(installDir).find((f) => f.startsWith('mongodb-database-tools'));
      if (folder) {
        const src = path.join(installDir, folder);
        fs.readdirSync(src).forEach((item) => {
          fs.renameSync(path.join(src, item), path.join(installDir, item));
        });
        fs.rmSync(src, { recursive: true });
      }
    }

    fs.unlinkSync(archivePath);
    console.log('Done');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

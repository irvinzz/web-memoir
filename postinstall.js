// offline-internet/postinstall.js
//
// This script downloads the MongoDB binaries suitable for the current
// platform/architecture during the post‑install phase.
// It automatically detects the OS and arch, removes unnecessary binaries,
// and writes an instance.json describing where the binaries live.

const { downloadMongoDbWithVersionInfo } = require('@mongodb-js/mongodb-downloader');
const { writeFileSync, unlinkSync, existsSync, mkdirSync } = require('node:fs');
const { join, sep } = require('node:path');

const RESOURCES_DIR = join(__dirname, 'resources', 'mongodb');

// Ensure the resources directory exists before we download into it
if (!existsSync(RESOURCES_DIR)) {
  mkdirSync(RESOURCES_DIR, { recursive: true });
}

// Use a fixed MongoDB version or override via environment variable
const MONGODB_VERSION = process.env.MONGODB_VERSION || '8.0.17';

downloadMongoDbWithVersionInfo({
  directory: RESOURCES_DIR,
  useLockfile: true,
  downloadOptions: {
    productionOnly: true,
    platform: process.platform,
    arch: process.arch,
    distro: process.platform === 'linux' ? 'debian12' : undefined,
  },
  version: MONGODB_VERSION,
})
  .then((results) => {
    console.debug('MongoDB download results:', results);

    // Clean up binaries that are not needed for this application
    const filesToUnlink = [
      join('bin', process.platform === 'win32' ? 'mongos.exe' : 'mongos'),
      join('bin', 'install_compass'),
    ];

    for (const file of filesToUnlink) {
      const pathToRemove = join(results.downloadedBinDir, '..', file);
      try {
        unlinkSync(pathToRemove);
      } catch {
        // Ignore if the file is missing
      }
    }

    // Write instance.json that points to the relative binDir
    const instanceFile = join(__dirname, 'resources', 'mongodb', 'instance.json');
    const binDirRelative = results.downloadedBinDir.replace(
      join(__dirname, 'resources', 'mongodb') + sep,
      '',
    );

    writeFileSync(
      instanceFile,
      JSON.stringify({ binDir: binDirRelative }, null, 2),
      'utf-8',
    );
  })
  .catch((err) => {
    console.error('Failed to download MongoDB:', err);
    process.exit(1);
  });

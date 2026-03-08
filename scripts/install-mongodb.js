const { downloadMongoDbWithVersionInfo } = require('@mongodb-js/mongodb-downloader');
const { writeFileSync, unlinkSync, existsSync, mkdirSync } = require('node:fs');
const { join, sep } = require('node:path');

const cwd = process.cwd();
const RESOURCE_DIR = join(cwd, 'resources');
const MONGODB_DL_DIR = join(RESOURCE_DIR, 'mongodb');

// Ensure the resources directory exists before we download into it
if (!existsSync(MONGODB_DL_DIR)) {
  mkdirSync(MONGODB_DL_DIR, { recursive: true });
}

// Use a fixed MongoDB version or override via environment variable
const MONGODB_VERSION = process.env.MONGODB_VERSION || '8.0.17';

downloadMongoDbWithVersionInfo({
  directory: MONGODB_DL_DIR,
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
    const filesToUnlink = {
      win32: [
        join('bin', 'vc_redist.x64.exe'),
        join('bin', 'Install-Compass.ps1'),
        results.artifact,
      ],
      linux: [
        join('bin', 'mongos'),
        join('bin', 'install_compass'),
      ],
    };

    for (const file of filesToUnlink[process.platform]) {
      const pathToRemove = join(results.downloadedBinDir, '..', file);
      try {
        unlinkSync(pathToRemove);
      } catch {
        // Ignore if the file is missing
      }
    }

    // Write instance.json that points to the relative binDir
    const instanceFile = join(cwd, 'resources', 'mongodb', 'instance.json');
    const binDirRelative = results.downloadedBinDir.replace(
      join(cwd, 'resources', 'mongodb') + sep,
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

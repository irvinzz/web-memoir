const { execSync } = require('node:child_process');
const { mkdirSync, renameSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

const cwd = process.cwd();
const targetDir = join(cwd, 'resources', 'playwright-cache', 'ms-playwright');

if (process.platform === 'darwin') {
  // On macOS, playwright uses ~/Library/Caches/ms-playwright.
  // Set HOME to a temp folder so we can control the cache location,
  // then move the downloaded browser into resources/playwright-cache.
  const tempHome = join(tmpdir(), 'playwright-install-' + Date.now());
  mkdirSync(tempHome, { recursive: true });

  try {
    execSync('npx playwright install chromium', {
      env: { ...process.env, HOME: tempHome },
      stdio: 'inherit',
    });

    const playwrightDir = join(tempHome, 'Library', 'Caches', 'ms-playwright');
    mkdirSync(join(cwd, 'resources', 'playwright-cache'), { recursive: true });
    renameSync(playwrightDir, targetDir);
  } finally {
    try {
      rmSync(tempHome, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
} else if (process.platform === 'linux') {
  process.env.XDG_CACHE_HOME = join(cwd, 'resources', 'playwright-cache');
  execSync('npx playwright install chromium', { stdio: 'inherit' });
} else if (process.platform === 'win32') {
  process.env.LOCALAPPDATA = join(cwd, 'resources', 'playwright-cache');
  execSync('npx playwright install chromium', { stdio: 'inherit' });
} else {
  console.error('Unsupported platform:', process.platform);
  process.exit(1);
}

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DIST_DIR = path.resolve('d:/daffodil/international-ai-builder/frontend/dist/frontend/browser');
const OUT_DIR = path.resolve('d:/daffodil/video/public/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// 1. Simple SPA static server
function createServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let safePath = path.normalize(decodeURI(req.url.split('?')[0]));
      if (safePath === '\\' || safePath === '/') safePath = '/index.html';
      let filePath = path.join(DIST_DIR, safePath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(port, () => {
      console.log(`Static server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Chrome paths to check
function getExecutablePath() {
  const candidates = [
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('No Chrome or Edge executable found!');
}

async function capture() {
  const PORT = 4280;
  const server = await createServer(PORT);
  const executablePath = getExecutablePath();
  console.log('Using browser at:', executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Load landing page first to set localStorage
  console.log('Navigating to root to initialize storage...');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Inject session
  console.log('Injecting auth session...');
  await page.evaluate(() => {
    const session = {
      token: 'fs_tok_demo_lead_analyst',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      rememberMe: true,
      user: {
        id: 'USR-1001',
        fullName: 'Maya Lin',
        email: 'maya.lin@fraudshield.ai',
        emailVerified: true,
        accountType: 'organization',
        avatarInitials: 'ML',
        country: 'United States',
        jobTitle: 'Lead Fraud Intelligence Analyst',
        twoFactorEnabled: true,
        createdAt: new Date().toISOString(),
      },
      activeWorkspaceId: 'WS-901',
      activeRole: 'OWNER',
    };
    localStorage.setItem('fs_auth_session_v1', JSON.stringify(session));
  });

  const targets = [
    { route: '/', filename: 'landing.png', waitMs: 1500 },
    { route: '/auth/sign-in', filename: 'signin.png', waitMs: 1500 },
    { route: '/app/simulator', filename: 'simulator.png', waitMs: 2500 },
    { route: '/app/monitoring', filename: 'monitoring.png', waitMs: 2500 },
    { route: '/app/explainability', filename: 'explainability.png', waitMs: 2500 },
    { route: '/app/fraud-network', filename: 'fraud-network.png', waitMs: 3000 },
    { route: '/app/copilot', filename: 'copilot.png', waitMs: 2500 },
  ];

  for (const t of targets) {
    const url = `http://localhost:${PORT}${t.route}`;
    console.log(`Capturing ${t.route} -> ${t.filename}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise((r) => setTimeout(r, t.waitMs));

      // Extra click/interaction if needed
      if (t.route === '/app/simulator') {
        // Try clicking start/run button if exists
        try {
          const runBtn = await page.$('button');
          if (runBtn) {
            // let simulation state trigger
          }
        } catch (_) {}
      }

      const savePath = path.join(OUT_DIR, t.filename);
      await page.screenshot({ path: savePath, type: 'png' });
      console.log(`Saved: ${savePath}`);
    } catch (err) {
      console.error(`Error capturing ${t.route}:`, err.message);
    }
  }

  await browser.close();
  server.close();
  console.log('Done capturing screenshots!');
}

capture().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});

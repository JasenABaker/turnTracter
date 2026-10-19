const { app, BrowserWindow, dialog, Menu } = require('electron');
const { spawn, execFile } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const BACKEND_PORT = 8080;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const READY_TIMEOUT_MS = 30000;
const POLL_INTERVAL_MS = 500;

let backendProcess = null;
let mainWindow = null;
let playerWindow = null;
let companionTrackerWindow = null;
let monsterRosterWindow = null;

app.setName('TurnTracker');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(main);
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', stopBackend);
}

async function main() {
  const javaBin = await resolveJavaBinary();
  if (!javaBin) {
    dialog.showErrorBox(
      'Java Not Found',
      'TurnTracker requires a Java 17+ runtime. Install one (e.g. `brew install openjdk@17`) and relaunch.'
    );
    app.quit();
    return;
  }

  const jarPath = getJarPath();
  if (!fs.existsSync(jarPath)) {
    dialog.showErrorBox('Backend Missing', `Could not find backend jar at:\n${jarPath}`);
    app.quit();
    return;
  }

  const alreadyUp = await pingOnce(BACKEND_URL, 500).catch(() => false);
  if (!alreadyUp) {
    startBackend(javaBin, jarPath);
  }

  try {
    await waitForServer(BACKEND_URL, READY_TIMEOUT_MS);
  } catch (e) {
    dialog.showErrorBox(
      'Startup Timed Out',
      `The backend did not respond within ${READY_TIMEOUT_MS / 1000}s. See backend.log in the app's data folder.`
    );
    app.quit();
    return;
  }

  buildMenu();
  createWindow();
}

function buildMenu() {
  const template = [
    { role: 'appMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      label: 'Views',
      submenu: [
        {
          label: 'GM Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(`${BACKEND_URL}/gm`);
              mainWindow.focus();
            } else {
              createWindow('/gm');
            }
          },
        },
        {
          label: 'Player Display',
          accelerator: 'CmdOrCtrl+2',
          click: openPlayerWindow,
        },
        {
          label: 'Companions',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(`${BACKEND_URL}/companions`);
              mainWindow.focus();
            } else {
              createWindow('/companions');
            }
          },
        },
        {
          label: 'Companion Tracker',
          accelerator: 'CmdOrCtrl+4',
          click: openCompanionTrackerWindow,
        },
        {
          label: 'Monster Roster',
          accelerator: 'CmdOrCtrl+5',
          click: openMonsterRosterWindow,
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function openPlayerWindow() {
  if (playerWindow) {
    playerWindow.focus();
    return;
  }
  playerWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'TurnTracker — Player Display',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  playerWindow.loadURL(`${BACKEND_URL}/player`);
  playerWindow.on('closed', () => {
    playerWindow = null;
  });
}

function openCompanionTrackerWindow() {
  if (companionTrackerWindow) {
    companionTrackerWindow.focus();
    return;
  }
  companionTrackerWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'TurnTracker — Companion Tracker',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  companionTrackerWindow.loadURL(`${BACKEND_URL}/companion-tracker`);
  companionTrackerWindow.on('closed', () => {
    companionTrackerWindow = null;
  });
}

function openMonsterRosterWindow() {
  if (monsterRosterWindow) {
    monsterRosterWindow.focus();
    return;
  }
  monsterRosterWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'TurnTracker — Monster Roster',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  monsterRosterWindow.loadURL(`${BACKEND_URL}/monster-roster`);
  monsterRosterWindow.on('closed', () => {
    monsterRosterWindow = null;
  });
}

function resolveJavaBinary() {
  return new Promise((resolve) => {
    execFile('/usr/libexec/java_home', ['-v', '17'], (err, stdout) => {
      if (!err && stdout.trim()) return resolve(path.join(stdout.trim(), 'bin', 'java'));
      execFile('/usr/libexec/java_home', (err2, stdout2) => {
        if (!err2 && stdout2.trim()) return resolve(path.join(stdout2.trim(), 'bin', 'java'));
        const fallbacks = [
          '/opt/homebrew/opt/openjdk@17/bin/java',
          '/usr/local/opt/openjdk@17/bin/java',
          '/opt/homebrew/opt/openjdk/bin/java',
          '/usr/local/opt/openjdk/bin/java',
        ];
        resolve(fallbacks.find((p) => fs.existsSync(p)) || null);
      });
    });
  });
}

function getJarPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.jar')
    : path.join(__dirname, 'resources', 'app.jar');
}

function getDbUrl() {
  const dataDir = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  return `jdbc:h2:file:${path.join(dataDir, 'initiative_tracker')}`;
}

function getUploadsDir() {
  const dataDir = path.join(app.getPath('userData'), 'data');
  const uploadsDir = path.join(dataDir, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  return uploadsDir;
}

function startBackend(javaBin, jarPath) {
  const logPath = path.join(app.getPath('userData'), 'backend.log');
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });

  backendProcess = spawn(javaBin, ['-jar', jarPath], {
    env: {
      ...process.env,
      SPRING_DATASOURCE_URL: getDbUrl(),
      SERVER_PORT: String(BACKEND_PORT),
      APP_UPLOADS_DIR: getUploadsDir(),
    },
  });

  backendProcess.stdout.pipe(logStream);
  backendProcess.stderr.pipe(logStream);
  backendProcess.on('error', (err) => dialog.showErrorBox('Backend Failed to Start', String(err)));
  backendProcess.on('exit', () => {
    backendProcess = null;
  });
}

function pingOnce(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(true);
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const exitHandler = (code) => reject(new Error(`Backend exited early (code ${code})`));
    if (backendProcess) backendProcess.once('exit', exitHandler);

    const attempt = () => {
      pingOnce(url, 2000).then(
        () => {
          if (backendProcess) backendProcess.removeListener('exit', exitHandler);
          resolve();
        },
        () => {
          if (Date.now() > deadline) return reject(new Error('timeout'));
          setTimeout(attempt, POLL_INTERVAL_MS);
        }
      );
    };
    attempt();
  });
}

function createWindow(initialPath = '') {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'TurnTracker',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  mainWindow.loadURL(`${BACKEND_URL}${initialPath}`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function stopBackend() {
  if (!backendProcess) return;
  const proc = backendProcess;
  proc.kill('SIGTERM');
  setTimeout(() => {
    try {
      proc.kill('SIGKILL');
    } catch (_) {}
  }, 5000);
}

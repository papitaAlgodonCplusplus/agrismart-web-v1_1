/**
 * AgriSmart IoT Valve Simulator
 *
 * Polls IrrigationPlanEntry every 5 minutes and simulates a valve controller:
 *   - If now > executionDate and status is not "executing"/"finished" → set status "executing",
 *     retrieveDate = executionDate, stopDate = executionDate + duration minutes
 *   - If status is "executing" and now > stopDate → set status "finished", stopDate = now (actual stop)
 *
 * Usage: node iot-valve-simulator.js
 */

'use strict';

const https = require('https');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const BLYNK = {
  token:   'jOpGvVwRSfEb-AO4hhF5IDqIIjqJTcSp',
  baseUrl: 'blynk.cloud',
};

// sector ID → Blynk virtual pin
const SECTOR_PIN = { 1: 'V4', 2: 'V5', 3: 'V6' };

const CONFIG = {
  baseUrl:         'https://localhost:7029',
  email:           'csolano@iapcr.com',
  password:        '123',
  updatedBy:       1,
  pollIntervalMs:  1 * 60 * 1000,   // 1 minute
};

// ─── ANSI COLORS ─────────────────────────────────────────────────────────────

const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  // foreground
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
  // bright foreground
  bRed:    '\x1b[91m',
  bGreen:  '\x1b[92m',
  bYellow: '\x1b[93m',
  bBlue:   '\x1b[94m',
  bCyan:   '\x1b[96m',
};

function c(color, text) { return `${color}${text}${C.reset}`; }

// ─── ASCII ART ────────────────────────────────────────────────────────────────

//  Valve CLOSED  (status: waiting / finished)
function valveClosed(label) {
  return [
    c(C.gray,    '        ┌─────┐        '),
    c(C.gray,    '  ══════╡') + c(C.bRed, '  ✕  ') + c(C.gray, '╞══════'),
    c(C.gray,    '        └──┬──┘        '),
    c(C.gray,    '           │           '),
    c(C.gray,    '          ═╧═          '),
    c(C.red,     `     [ ${label.padEnd(10)} ]    `),
  ].join('\n');
}

//  Valve OPEN  (status: executing / watering)
//  Water drops animate between frames
const WATER_FRAMES = [
  [
    '      │  │  │       ',
    '     ╲│╱ │ ╲│╱      ',
    '      ○  ○  ○       ',
  ],
  [
    '      ○  ○  ○       ',
    '      │  │  │       ',
    '     ╲│╱ │ ╲│╱      ',
  ],
  [
    '     ╲│╱ │ ╲│╱      ',
    '      ○  ○  ○       ',
    '      │  │  │       ',
  ],
];
let _waterFrame = 0;

function valveOpen(label, timeLeft) {
  const frame = WATER_FRAMES[_waterFrame % WATER_FRAMES.length];
  return [
    c(C.cyan,    '        ┌─────┐        '),
    c(C.cyan,    '  ══════╡') + c(C.bGreen, '  ◎  ') + c(C.cyan, '╞══════'),
    c(C.cyan,    '        └──┬──┘        '),
    c(C.bBlue,   '           │           '),
    c(C.bBlue,   frame[0]),
    c(C.bBlue,   frame[1]),
    c(C.bBlue,   frame[2]),
    c(C.bGreen,  `     [ ${label.padEnd(10)} ]    `),
    c(C.cyan,    `     stops in ${timeLeft}   `),
  ].join('\n');
}

//  Valve DONE
function valveDone(label) {
  return [
    c(C.gray,    '        ┌─────┐        '),
    c(C.gray,    '  ══════╡') + c(C.green, '  ✔  ') + c(C.gray, '╞══════'),
    c(C.gray,    '        └──┬──┘        '),
    c(C.gray,    '           │           '),
    c(C.gray,    '          ═╧═          '),
    c(C.green,   `     [ ${label.padEnd(10)} ]    `),
  ].join('\n');
}

// Print a card with separator lines
function printCard(art, info) {
  const sep = c(C.gray, '─'.repeat(40));
  console.log(sep);
  console.log(art);
  console.log(c(C.dim, info));
  console.log(sep);
}

// ─── HTTP HELPER ─────────────────────────────────────────────────────────────

const agent = new https.Agent({ rejectUnauthorized: false });

let token = null;
let tokenExpiry = null;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const url = new URL(path, CONFIG.baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers,
      agent,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function login() {
  log('AUTH', 'Logging in...');
  const { status, body } = await request('POST', '/Authentication/Login', {
    userEmail: CONFIG.email,
    password:  CONFIG.password,
  });

  if (status !== 200 || !body.result?.token) {
    throw new Error(`Login failed (HTTP ${status}): ${JSON.stringify(body)}`);
  }

  token       = body.result.token;
  tokenExpiry = new Date(body.result.validTo);
  log('AUTH', `Token valid until ${tokenExpiry.toISOString()}`);
}

async function ensureToken() {
  const now = new Date();
  if (!token || !tokenExpiry || (tokenExpiry - now) < 10 * 60 * 1000) {
    await login();
  }
}

// ─── API CALLS ────────────────────────────────────────────────────────────────

async function getEntries() {
  const { status, body } = await request('GET', '/IrrigationPlanEntry');
  if (status !== 200 || !body.result) {
    throw new Error(`GET entries failed (HTTP ${status}): ${JSON.stringify(body)}`);
  }
  return body.result.irrigationPlanEntries || [];
}

async function updateEntry(entry, changes) {
  const payload = {
    id:               entry.id,
    irrigationPlanId: entry.irrigationPlanId,
    irrigationModeId: entry.irrigationModeId,
    executionDate:    entry.executionDate   ?? null,
    duration:         entry.duration,
    wStart:           entry.wStart          ?? null,
    wEnd:             entry.wEnd            ?? null,
    frequency:        entry.frequency       ?? null,
    sequence:         entry.sequence,
    active:           entry.active,
    updatedBy:        CONFIG.updatedBy,
    status:           entry.status          ?? null,
    stopDate:         entry.stopDate        ?? null,
    retrieveDate:     entry.retrieveDate    ?? null,
    ...changes,
  };

  const { status, body } = await request('PUT', '/IrrigationPlanEntry', payload);
  if (status !== 200) {
    throw new Error(`PUT entry ${entry.id} failed (HTTP ${status}): ${JSON.stringify(body)}`);
  }
}

// ─── SIMULATION LOGIC ─────────────────────────────────────────────────────────

async function tick() {
  log('POLL', c(C.cyan, 'Fetching entries...'));

  let entries;
  try {
    entries = await getEntries();
  } catch (err) {
    log('ERROR', c(C.bRed, `Failed to fetch entries: ${err.message}`));
    return;
  }

  log('POLL', `Got ${c(C.bold, String(entries.length))} entries`);
  const now = new Date();
  _waterFrame++;

  for (const entry of entries) {
    try {
      await processEntry(entry, now);
    } catch (err) {
      log('ERROR', c(C.bRed, `Entry ${entry.id}: ${err.message}`));
    }
  }
}

async function processEntry(entry, now) {
  if (!entry.executionDate) return;

  const execDate = new Date(entry.executionDate);
  const stopDate = entry.stopDate ? new Date(entry.stopDate) : null;
  const status   = (entry.status || '').toLowerCase();
  const shortName = (entry.irrigationPlanName || `#${entry.id}`).substring(0, 10);

  // ── START ────────────────────────────────────────────────────────────────────
  if (status !== 'executing' && status !== 'finished' && now > execDate) {
    const plannedStop = new Date(now.getTime() + entry.duration * 60 * 1000);
    const sectorPin   = SECTOR_PIN[entry.sectorID];

    printCard(
      valveOpen(shortName, formatMs(plannedStop - now)),
      `  Entry #${entry.id} | Plan: ${entry.irrigationPlanName}\n` +
      `  Started:  ${now.toLocaleString()}\n` +
      `  Duration: ${entry.duration} min\n` +
      `  Stops at: ${plannedStop.toLocaleString()}`
    );

    log('BLYNK', `Turning ON pump V3 for entry #${entry.id}`);
    await blynkSet('V3', 1);
    await sleep(3000);
    if (sectorPin) {
      log('BLYNK', `Turning ON sector valve ${sectorPin} (sector ${entry.sectorID}) for entry #${entry.id}`);
      await blynkSet(sectorPin, 1);
    }

    await updateEntry(entry, {
      status:       'executing',
      retrieveDate: now.toISOString(),
      stopDate:     plannedStop.toISOString(),
    });
    return;
  }

  // ── STOP ─────────────────────────────────────────────────────────────────────
  if (status === 'executing' && stopDate && now > stopDate) {
    const sectorPin = SECTOR_PIN[entry.sectorID];

    printCard(
      valveDone(shortName),
      `  Entry #${entry.id} | Plan: ${entry.irrigationPlanName}\n` +
      `  Finished at: ${now.toLocaleString()}`
    );

    log('BLYNK', `Turning OFF pump V3 for entry #${entry.id}`);
    await blynkSet('V3', 0);
    if (sectorPin) {
      log('BLYNK', `Turning OFF sector valve ${sectorPin} (sector ${entry.sectorID}) for entry #${entry.id}`);
      await blynkSet(sectorPin, 0);
    }

    await updateEntry(entry, {
      status:   'finished',
      stopDate: now.toISOString(),
    });
    return;
  }

  // ── STILL EXECUTING (mid-cycle display) ──────────────────────────────────────
  if (status === 'executing' && stopDate) {
    printCard(
      valveOpen(shortName, formatMs(stopDate - now)),
      `  Entry #${entry.id} | Plan: ${entry.irrigationPlanName}\n` +
      `  Currently watering — stops at: ${stopDate.toLocaleString()}`
    );
    return;
  }

  // ── WAIT ─────────────────────────────────────────────────────────────────────
  if (status !== 'finished') {
    const msUntil = execDate - now;
    if (msUntil > 0) {
      printCard(
        valveClosed(shortName),
        `  Entry #${entry.id} | Plan: ${entry.irrigationPlanName}\n` +
        `  Scheduled: ${execDate.toLocaleString()}\n` +
        `  Starts in: ${formatMs(msUntil)}`
      );
    }
  }
}

// ─── BLYNK HELPER ────────────────────────────────────────────────────────────

function blynkSet(pin, value) {
  return new Promise((resolve, reject) => {
    const path = `/external/api/update?token=${BLYNK.token}&${pin}=${value}`;
    const req = https.request(
      { hostname: BLYNK.baseUrl, port: 443, path, method: 'GET' },
      (res) => { res.resume(); res.on('end', resolve); }
    );
    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function log(tag, msg) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const tagColored = {
    AUTH:  c(C.magenta, 'AUTH '),
    POLL:  c(C.cyan,    'POLL '),
    ERROR: c(C.bRed,    'ERROR'),
    INIT:  c(C.bGreen,  'INIT '),
    BLYNK: c(C.bYellow, 'BLYNK'),
  }[tag] ?? tag.padEnd(5);
  console.log(`${c(C.gray, `[${ts}]`)} [${tagColored}] ${msg}`);
}

function formatMs(ms) {
  if (ms <= 0) return '0s';
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || !parts.length) parts.push(`${s}s`);
  return parts.join(' ');
}

// ─── STARTUP BANNER ───────────────────────────────────────────────────────────

function printBanner() {
  console.log(c(C.bCyan, `
  ╔══════════════════════════════════════════╗
  ║   🌱  AgriSmart IoT Valve Simulator  🌱  ║
  ╠══════════════════════════════════════════╣
  ║  Polling every ${String(CONFIG.pollIntervalMs / 1000).padEnd(6)}s               ║
  ║  API: ${CONFIG.baseUrl.padEnd(34)} ║
  ╚══════════════════════════════════════════╝`));
  console.log();
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  printBanner();
  log('INIT', `Starting up...`);

  try {
    await ensureToken();
  } catch (err) {
    log('ERROR', `Startup auth failed: ${err.message}`);
    process.exit(1);
  }

  await tick();
  setInterval(async () => {
    try {
      await ensureToken();
      await tick();
    } catch (err) {
      log('ERROR', err.message);
    }
  }, CONFIG.pollIntervalMs);
}

main();

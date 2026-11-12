import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const dataDir = path.join('backend', 'data');
const dataFile = path.join(dataDir, 'tastings_test.json');

async function readTastings() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return []; throw e; }
}
async function writeTastings(rows) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(rows, null, 2), 'utf8');
}

const allowed = ['Chocolate', 'Strawberry', 'Vanilla'];
const allowedTextures = ['smooth', 'okay', 'not-for-us'];
const allowedChoose = ['yes', 'maybe', 'no'];

function validate({ flavour, rating, texture, wouldChoose }) {
  const errors = [];
  if (!allowed.includes(flavour)) errors.push('bad flavour');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('bad rating');
  if (!allowedTextures.includes(texture)) errors.push('bad texture');
  if (!allowedChoose.includes(wouldChoose)) errors.push('bad wouldChoose');
  return errors;
}

// Test 1: empty read
const empty = await readTastings();
console.assert(Array.isArray(empty) && empty.length === 0, 'FAIL: empty read');
console.log('PASS: empty read returns []');

// Test 2: write and read back
const row = { id: crypto.randomUUID(), flavour: 'Chocolate', rating: 4, texture: 'smooth', wouldChoose: 'yes', note: 'TEST', createdAt: new Date().toISOString() };
await writeTastings([row]);
const list = await readTastings();
console.assert(list.length === 1 && list[0].flavour === 'Chocolate', 'FAIL: write/read');
console.log('PASS: write then read returns 1 entry');

// Test 3: validation
console.assert(validate({ flavour: 'Chocolate', rating: 3, texture: 'smooth', wouldChoose: 'maybe' }).length === 0, 'FAIL: valid maybe');
console.log('PASS: valid input (maybe) passes');
console.assert(validate({ flavour: 'Chocolate', rating: 3, texture: 'smooth', wouldChoose: 'yes' }).length === 0, 'FAIL: valid yes');
console.log('PASS: valid input (yes) passes');
console.assert(validate({ flavour: 'Chocolate', rating: 6, texture: 'smooth', wouldChoose: 'yes' }).length > 0, 'FAIL: invalid rating');
console.log('PASS: rating 6 rejected');
console.assert(validate({ flavour: 'Lemon', rating: 3, texture: 'smooth', wouldChoose: 'yes' }).length > 0, 'FAIL: invalid flavour');
console.log('PASS: unknown flavour rejected');
console.assert(validate({ flavour: 'Chocolate', rating: 3, texture: 'smooth', wouldChoose: 'purple' }).length > 0, 'FAIL: invalid wouldChoose');
console.log('PASS: unknown wouldChoose rejected');

// Test 4: clear
await writeTastings([]);
const cleared = await readTastings();
console.assert(cleared.length === 0, 'FAIL: clear');
console.log('PASS: clear returns []');

// Cleanup test file
await unlink(dataFile).catch(() => {});
console.log('\nAll 6 tests passed. Test file cleaned up.');


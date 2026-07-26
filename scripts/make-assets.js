// Generates simple solid-color placeholder PNGs so the Expo build has valid
// icon/splash assets. Replace these with real artwork before publishing.
// Run:  node scripts/make-assets.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crc]);
}

function makePng(width, height, [r, g, b, a = 255]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const row = Buffer.alloc(1 + width * 4);
  for (let x = 0; x < width; x++) {
    row[1 + x * 4] = r;
    row[1 + x * 4 + 1] = g;
    row[1 + x * 4 + 2] = b;
    row[1 + x * 4 + 3] = a;
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(dir, { recursive: true });

const teal = [14, 165, 164];
const white = [255, 255, 255];

fs.writeFileSync(path.join(dir, 'icon.png'), makePng(1024, 1024, teal));
fs.writeFileSync(path.join(dir, 'adaptive-icon.png'), makePng(1024, 1024, teal));
fs.writeFileSync(path.join(dir, 'splash.png'), makePng(1284, 2778, teal));
fs.writeFileSync(path.join(dir, 'notification-icon.png'), makePng(96, 96, white));
fs.writeFileSync(path.join(dir, 'favicon.png'), makePng(48, 48, teal));

console.log('Placeholder assets written to', dir);

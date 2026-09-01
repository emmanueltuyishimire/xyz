// start-dev.cjs — Launches Astro dev and writes output to dev.log
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'dev.log');
const log = fs.createWriteStream(logFile, { flags: 'w' });

const child = spawn('node', ['node_modules/astro/astro.js', 'dev'], {
  cwd: __dirname,
  env: process.env,
});

const onData = (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  log.write(text);
};

child.stdout.on('data', onData);
child.stderr.on('data', onData);

child.on('exit', (code) => {
  const msg = `\n[start-dev] Process exited with code ${code}\n`;
  log.write(msg);
  console.log(msg);
});

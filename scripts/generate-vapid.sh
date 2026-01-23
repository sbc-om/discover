#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to run this script."
  exit 1
fi

node <<'NODE'
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const envPath = path.join(process.cwd(), '.env');
const { publicKey, privateKey } = webpush.generateVAPIDKeys();

const lines = fs.existsSync(envPath)
  ? fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  : [];

const setEnv = (key, value) => {
  const idx = lines.findIndex((line) => line.startsWith(`${key}=`));
  if (idx >= 0) {
    lines[idx] = `${key}=${value}`;
  } else {
    lines.push(`${key}=${value}`);
  }
};

setEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', publicKey);
setEnv('VAPID_PUBLIC_KEY', publicKey);
setEnv('VAPID_PRIVATE_KEY', privateKey);
setEnv('VAPID_SUBJECT', lines.find(l => l.startsWith('VAPID_SUBJECT='))?.split('=')[1] || 'mailto:admin@example.com');

fs.writeFileSync(envPath, lines.filter(Boolean).join('\n') + '\n');
console.log('VAPID keys written to .env');
NODE

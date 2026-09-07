'use strict';

const path = require('node:path');

const APP_ORIGIN = 'app://yks';
const APP_URL = `${APP_ORIGIN}/index.html`;
const DOCUMENT_PATHS = new Set(['/privacy.html', '/data-deletion.html', '/anatomy/ATTRIBUTION.md']);
const EMBED_HOSTS = new Set(['www.youtube-nocookie.com', 'www.youtube.com']);
// Legacy scripts and inline controls still require unsafe-inline. Node access,
// eval, arbitrary remote scripts, frames and objects remain unavailable.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://upload.wikimedia.org https://*.googleusercontent.com",
  "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://www.googleapis.com https://tr.wikipedia.org",
  'frame-src https://www.youtube-nocookie.com https://www.youtube.com',
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

function appUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'app:' && parsed.hostname === 'yks' && !parsed.port && !parsed.username && !parsed.password ? parsed : null;
  } catch { return null; }
}

function resolveAppAsset(value, assetRoot) {
  const parsed = appUrl(value);
  if (!parsed) return null;
  let pathname;
  try { pathname = decodeURIComponent(parsed.pathname); } catch { return null; }
  if (/[\\\0:]/.test(pathname) || pathname.split('/').some(part => part === '..' || part === '.')) return null;
  const relativeName = pathname === '/' || pathname === '' ? 'index.html' : pathname.replace(/^\/+/, '');
  const absoluteRoot = path.resolve(assetRoot);
  const absoluteFile = path.resolve(absoluteRoot, relativeName);
  const relative = path.relative(absoluteRoot, absoluteFile);
  return relative && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative) ? absoluteFile : null;
}

function isMainPage(value) {
  const parsed = appUrl(value);
  return !!parsed && (parsed.pathname === '/' || parsed.pathname === '/index.html');
}

function isLocalDocument(value) {
  const parsed = appUrl(value);
  return !!parsed && DOCUMENT_PATHS.has(parsed.pathname);
}

function externalUrl(value) {
  if (typeof value !== 'string' || value.length > 4096 || /[\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : null;
  } catch { return null; }
}

function isAllowedFrame(value) {
  if (value === 'about:blank') return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password && !parsed.port && EMBED_HOSTS.has(parsed.hostname) && parsed.pathname.startsWith('/embed');
  } catch { return false; }
}

function isAllowedDownload(value, filename) {
  // Exports are data created inside this app, never remotely supplied programs.
  return typeof value === 'string' && value.startsWith('blob:app://yks/') && /\.(json|csv|txt|md|ics|png|pdf)$/i.test(filename) && !/[\\/:\u0000-\u001f]/.test(filename);
}

module.exports = { APP_ORIGIN, APP_URL, CONTENT_SECURITY_POLICY, appUrl, resolveAppAsset, isMainPage, isLocalDocument, externalUrl, isAllowedFrame, isAllowedDownload };

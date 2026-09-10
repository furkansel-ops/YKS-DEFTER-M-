'use strict';

// Keep the existing Windows CI entry point. The account-first smoke suite
// exercises real storage across separate Electron processes, temporary guest
// work, native sandbox/PDF/file-navigation protections, and fail-closed startup.
// It deliberately does not inject an authenticated session or live credentials.
require('./account-smoke.cjs');

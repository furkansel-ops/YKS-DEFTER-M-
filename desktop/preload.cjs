'use strict';

const { contextBridge } = require('electron');

// No IPC, filesystem, shell, credentials or arbitrary method bridge is exposed.
contextBridge.exposeInMainWorld('__YKS_DESKTOP__', Object.freeze({
  platform: 'win32',
  installed: true,
  distribution: 'github',
}));

const ow = require('@overwolf/ow-electron');
console.log('Overwolf Electron exports:');
console.log('Keys:', Object.keys(ow));
console.log('Has app:', !!ow.app);
console.log('Has BrowserWindow:', !!ow.BrowserWindow);
console.log('Type:', typeof ow);

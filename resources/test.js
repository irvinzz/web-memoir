#!/bin/env node

console.debug(process.versions);
console.debug(__filename);
console.debug(__dirname);
setTimeout(() => {
  // do nothing
}, 999999999);

process.on('message', (msg) => {
  console.debug('parent->child', msg);
});

process.send('gr2', () => {

});

process.on('beforeExit', () => {
  console.debug('beforeExit');
});

process.on('exit', () => {
  console.debug('exit');
});

import { isDevMode } from '@angular/core';

export function arrayBufferToBufferCycle(ab): Buffer {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

export function keylistener(mode: boolean) {
  console.log(mode);
  if (mode) {
    document.addEventListener('keydown', keyPressed);
    function keyPressed(e) {
      console.log(e.code);
    }
  }
}

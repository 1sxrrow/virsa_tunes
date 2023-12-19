import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { default as EscPosEncoder } from '@manhnd/esc-pos-encoder';
import { encode } from 'punycode';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  constructor() {}

  printDocumentEscPosEncoder(){
    let encoder = new EscPosEncoder();

    encoder
      .initialize()
      .setPinterType(80)
      .text('The quick brown fox jumps over the lazy dog')
      .newline()
      .encode();
  }
  // Add your service methods here
}

import { Injectable } from '@angular/core';
import EscPosEncoder from '@manhnd/esc-pos-encoder';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  private device: any;

  constructor() {
    (navigator as any).usb.getDevices().then((devices) => {
      if (devices.length > 0) {
        devices.forEach((device) => {
          console.log(
            `Name: ${device.productName}, Serial: ${device.serialNumber}`
          );
          this.setDevice(device);
        });
      } else {
        (navigator as any).usb.requestDevice({ filters: [] }).then((device) => {
          if (device) {
            console.log(device);
            this.setDevice(device);
          } else {
            console.log('No device selected');
          }
        });
      }
    });
  }

  async printRecipe(device, result: EscPosEncoder) {
    console.log(device);
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    await device.transferOut(
      device.configuration.interfaces[0].alternate.endpoints.find(
        (obj) => obj.direction === 'out'
      ).endpointNumber,
      result
    );
    //new Uint8Array(new TextEncoder().encode(result.join('\r\n')))
    await device.close();
  }

  setDevice(device) {
    this.device = device;
  }

  getDevice() {
    return this.device;
  }

  private bluetoothDevicePairing() {
    (navigator as any).bluetooth
      .requestDevice({ acceptAllDevices: true })
      .then((device) => {
        console.log(device);
      });
  }
}

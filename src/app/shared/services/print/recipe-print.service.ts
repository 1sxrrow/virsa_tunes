import { Injectable } from '@angular/core';
import EscPosEncoder from '@manhnd/esc-pos-encoder';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  private device: any;

  // Create a new BehaviorSubject to hold the device status
  private deviceStatusSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  // Create a public Observable for components to subscribe to
  public deviceStatus$ = this.deviceStatusSubject.asObservable();

  constructor() {
    (navigator as any).usb.getDevices().then((devices) => {
      if (devices.length > 0) {
        devices.forEach((device) => {
          console.log(
            `Name: ${device.productName}, Serial: ${device.serialNumber}`
          );
          this.setDevice(device);
          this.deviceStatusSubject.next(
            'device selected: ' + device.productName + ' ' + device.serialNumber
          );
        });
      } else {
        (navigator as any).usb
          .requestDevice({ filters: [] })
          .then((device) => {
            if (device) {
              console.log(device);
              this.setDevice(device);
              this.deviceStatusSubject.next(
                'device selected: ' +
                  device.productName +
                  ' ' +
                  device.serialNumber
              );
            } else {
              console.log('No device selected');
              this.deviceStatusSubject.next('No device selected');
            }
          })
          .catch((error) => {
            console.log(error);
            if (error.message.includes('No device selected')) {
              console.log('No device selected');
              this.deviceStatusSubject.next('No device selected');
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

import { Injectable } from '@angular/core';
import EscPosEncoder from '@manhnd/esc-pos-encoder';
import { MessageService } from 'primeng/api';
import { callModalToast } from '../../utils/common-utils';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  private device: any;
  chosenDevice: boolean;

  constructor(private messageService: MessageService) {
    if (!this.device) {
      (navigator as any).usb.getDevices().then((devices) => {
        if (devices.length > 0) {
          devices.forEach((device) => {
            console.log(
              `Name: ${device.productName}, Serial: ${device.serialNumber}`
            );
            this.setDevice(device);
            setTimeout(
              () =>
                callModalToast(
                  this.messageService,
                  'Stampa',
                  `Stampante impostata Name:${device.productName}`,
                  'info'
                ),
              1000
            );
          });
        } else {
          this.chooseDevice();
        }
      });
    }
  }

  async printRecipe(device, result: EscPosEncoder) {
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

  chooseDevice() {
    (navigator as any).usb
      .requestDevice({ filters: [] })
      .then((device) => {
        if (device) {
          console.log(device);
          this.setDevice(device);
          setTimeout(
            () =>
              callModalToast(
                this.messageService,
                'Stampa',
                `Stampante impostata Name:${device.productName}`,
                'info'
              ),
            1000
          );
        } else {
          console.log('No device selected');
          setTimeout(
            () =>
              callModalToast(
                this.messageService,
                'Stampa',
                'Stampante non impostata',
                'warn'
              ),
            1000
          );
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
        } else if (error.message.includes('No device selected')) {
          console.log('No device selected');
          setTimeout(
            () =>
              callModalToast(
                this.messageService,
                'Stampa',
                'Stampante non impostata',
                'warn'
              ),
            1000
          );
        }
      });
  }

  setDeviceChosen(value: boolean) {
    this.chosenDevice = value;
  }

  isDeviceChosen() {
    return this.chosenDevice;
  }
}

import { Inject, Injectable, isDevMode } from '@angular/core';
import { UserModel } from 'src/app/shared/models/user-data.model';
import CryptoJS from 'crypto-js';
import _ from 'lodash';
import { IS_DEV_MODE } from 'src/app/app.module';
import { UserModelWithInterventi } from '../models/custom-interfaces';

@Injectable({ providedIn: 'root' })
export class UserCacheService {
  private cachedUsers: UserModel[] = [];
  private secretKey = 'VirsaDataBase';
  private cachedData: any = {};
  @Inject(IS_DEV_MODE) private isDevMode: boolean;

  cacheUsers(users: UserModel[]): void {
    this.cachedUsers = users;
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(users),
      this.secretKey
    ).toString();
    localStorage.setItem('cachedUsers', encryptedData);
  }

  getCachedUsers(): UserModel[] {
    const encryptedData = localStorage.getItem('cachedUsers');
    if (encryptedData) {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      this.cachedUsers = JSON.parse(decryptedData);
    }
    return this.cachedUsers;
  }

  cacheData(key: string, data: any): void {
    this.cachedData[key] = data;
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.secretKey
    ).toString();
    localStorage.setItem(key, encryptedData);
  }

  getCachedData(key: string): any {
    const encryptedData = localStorage.getItem(key);
    if (encryptedData) {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      this.cachedData[key] = JSON.parse(decryptedData);
    }
    return this.cachedData[key];
  }

  hasDataChanged(key: string, newData: any): boolean {
    const cachedData = this.getCachedData(key);
    if (!cachedData || cachedData.length === 0) {
      if (this.isDevMode) {
        console.log('No cached data found.');
      }
      return true;
    }
    const differences = this.findDifferences(cachedData, newData);
    if (differences.length > 0) {
      if (this.isDevMode) {
        console.log('Data has changed. Differences:', differences);
      }
      return true;
    } else {
      if (this.isDevMode) {
        console.log('Data has not changed.');
      }
      return false;
    }
  }

  private findDifferences(
    oldData: UserModelWithInterventi[],
    newData: UserModelWithInterventi[]
  ): any[] {
    const differences = [];
    if (!oldData || !newData) {
      return differences;
    }
    oldData.forEach((oldUser, index) => {
      const newUser = newData[index];
      if (!_.isEqual(oldUser, newUser)) {
        differences.push({
          type: 'user',
          index,
          oldItem: oldUser,
          newItem: newUser,
          changes: this.getObjectDifferences(oldUser, newUser),
        });
      }
    });

    return differences;
  }

  private getObjectDifferences(obj1: any, obj2: any): any {
    return _.reduce(
      obj1,
      (result, value, key) => {
        if (obj2 && obj2[key] !== undefined) {
          return _.isEqual(value, obj2[key])
            ? result
            : result.concat({ key, oldValue: value, newValue: obj2[key] });
        } else {
          return result.concat({ key, oldValue: value, newValue: undefined });
        }
      },
      []
    );
  }
}

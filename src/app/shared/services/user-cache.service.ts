import { Inject, Injectable, isDevMode } from '@angular/core';
import { UserModel } from 'src/app/shared/models/user-data.model';
import CryptoJS from 'crypto-js';
import _ from 'lodash';
import { IS_DEV_MODE } from 'src/app/app.module';

@Injectable({ providedIn: 'root' })
export class UserCacheService {
  private cachedUsers: UserModel[] = [];
  private secretKey = 'VirsaDataBase';
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

  hasDataChanged(newUsers: UserModel[]): boolean {
    const differences = this.findDifferences(this.cachedUsers, newUsers);
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

  private findDifferences(oldData: UserModel[], newData: UserModel[]): any[] {
    const differences = [];
    oldData.forEach((oldUser, index) => {
      const newUser = newData[index];
      if (!_.isEqual(oldUser, newUser)) {
        differences.push({
          index,
          oldUser,
          newUser,
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
        return _.isEqual(value, obj2[key])
          ? result
          : result.concat({ key, oldValue: value, newValue: obj2[key] });
      },
      []
    );
  }
}

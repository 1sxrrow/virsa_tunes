import { InjectionToken, NgModule } from '@angular/core';
import { AngularFireModule, FIREBASE_OPTIONS } from '@angular/fire/compat';
import {
  devFirebaseConfig,
  prodFirebaseConfig,
} from 'src/environments/environment';
import { FirebaseApp } from '@angular/fire/compat';

export const FIREBASE_APP_PROD = new InjectionToken<FirebaseApp>(
  'Prod'
);
export const FIREBASE_APP_DEV = new InjectionToken<FirebaseApp>(
  'Dev'
);

export function provideFirebaseAppProd() {
  return AngularFireModule.initializeApp(prodFirebaseConfig).ngModule;
}

export function provideFirebaseAppDev() {
  return AngularFireModule.initializeApp(devFirebaseConfig).ngModule;
}
@NgModule({
  imports: [AngularFireModule.initializeApp(prodFirebaseConfig)],
  providers: [
    {
      provide: FIREBASE_APP_PROD,
      useFactory: provideFirebaseAppProd,
      deps: [FIREBASE_OPTIONS],
    },
  ],
})
export class FirebaseProdModule {}

@NgModule({
  imports: [AngularFireModule.initializeApp(devFirebaseConfig)],
  providers: [
    {
      provide: FIREBASE_APP_DEV,
      useFactory: provideFirebaseAppDev,
      deps: [FIREBASE_OPTIONS],
      multi: true,
    },
  ],
})
export class FirebaseDevModule {}

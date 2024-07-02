import { InjectionToken } from '@angular/core';
import { getApp } from '@angular/fire/app';
import { Firestore, getFirestore } from '@angular/fire/firestore';
import { Database, getDatabase } from '@angular/fire/database';

export const FIRESTORE_PROD = new InjectionToken<Firestore>('firestore prod', {
  providedIn: 'root',
  factory: () => getFirestore(getApp('[DEFAULT]')),
});
export const FIREDATABASE_PROD = new InjectionToken<Database>(
  'firestore prod',
  {
    providedIn: 'root',
    factory: () => getDatabase(getApp('[DEFAULT]')),
  }
);
export const FIREDATABASE_DEV = new InjectionToken<Database>('firestore prod', {
  providedIn: 'root',
  factory: () => getDatabase(getApp('[DEV]')),
});
export const FIRESTORE_DEV = new InjectionToken<Firestore>('firestore dev', {
  providedIn: 'root',
  factory: () => getFirestore(getApp('[DEV]')),
});

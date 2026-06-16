export interface AccountRecord {
  id: string;
  name: string;
  uid: string;
  password: string;
  twoFactorKey: string;
  date: string;
  time: string;
}

export interface AppSettings {
  passwordPrefix: string;
  customNames: string; // Comma separated list
  enableOverlay: boolean;
  overlayOpacity: number; // 0.1 to 1.0
  overlaySize: 'small' | 'medium' | 'large';
}

export interface SourceFile {
  name: string;
  path: string;
  language: 'yaml' | 'xml' | 'dart';
  content: string;
}

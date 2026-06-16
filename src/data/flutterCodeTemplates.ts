import { SourceFile } from '../types';

export const FLUTTER_TEMPLATES: SourceFile[] = [
  {
    name: "pubspec.yaml",
    path: "pubspec.yaml",
    language: "yaml",
    content: `name: rubab_manager
description: A luxury glassmorphism Android Account Manager and Floating Overlay Service.
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.9
  flutter_foreground_task: ^6.1.0
  flutter_overlay_window: ^0.4.5
  excel: ^4.0.0
  path_provider: ^2.1.1
  sqflite: ^2.3.0
  permission_handler: ^11.1.0
  shared_preferences: ^2.2.2
  intl: ^0.19.0
  uuid: ^4.3.3
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`
  },
  {
    name: "AndroidManifest.xml",
    path: "android/app/src/main/AndroidManifest.xml",
    language: "xml",
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.rubab.manager">

    <!-- Permissions required for Overlay & Foreground service -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="Rubab Manager"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:requestLegacyExternalStorage="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|screenLayout|density|locale|layoutDirection|fontScale|screenLayout|direction|navigation">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme" />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <!-- Overlay Window Service -->
        <service
            android:name="io.flutter.overlay_window.flutter_overlay_window.OverlayWindowService"
            android:enabled="true"
            android:exported="false" />

        <!-- Foreground Service -->
        <service
            android:name="com.pravera.flutter_foreground_task.service.ForegroundService"
            android:enabled="true"
            android:exported="false" />

        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`
  },
  {
    name: "main.dart",
    path: "lib/main.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_overlay_window/flutter_overlay_window.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'lib/views/home_view.dart';
import 'lib/services/database_helper.dart';

@pragma("vm:entry-point")
void overlayMain() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: OverlayWidget()));
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DatabaseHelper.instance.database;
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rubab Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0F111A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF64FFDA),
          secondary: Color(0xFF00B0FF),
          surface: Color(0xFF1E2235),
        ),
      ),
      home: const HomeView(),
    );
  }
}

class OverlayWidget extends ConsumerWidget {
  const OverlayWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: Colors.transparent,
        body: Container(
          decoration: BoxDecoration(
            color: const Color(0xE610121B),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white10),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.5),
                blurRadius: 15,
                spreadRadius: 2,
              )
            ],
          ),
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'RUBAB MANAGER OVERLAY',
                style: TextStyle(
                  color: Color(0xFF64FFDA),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 10),
              _buildOverlayRow("USER", "Username", context),
              _buildOverlayRow("PASS", "Password", context),
              _buildOverlayRow("2FA", "2FA Key", context),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => FlutterOverlayWindow.closeOverlay(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent.withOpacity(0.2),
                      side: const BorderSide(color: Colors.redAccent),
                    ),
                    child: const Text('Close'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // Trigger record save
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00B0FF).withOpacity(0.2),
                      side: const BorderSide(color: Color(0xFF00B0FF)),
                    ),
                    child: const Text('Save Record'),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOverlayRow(String label, String value, BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.white12,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Text(
              'Click to Copy',
              style: TextStyle(color: Colors.white54, fontSize: 11, fontStyle: FontStyle.italic),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.copy, size: 16, color: Color(0xFF64FFDA)),
            onPressed: () {
              // Copy handler
            },
          )
        ],
      ),
    );
  }
}`
  },
  {
    name: "account_model.dart",
    path: "lib/models/account_model.dart",
    language: "dart",
    content: `class AccountRecord {
  final String id;
  final String name;
  final String uid;
  final String password;
  final String twoFactorKey;
  final String date;
  final String time;

  AccountRecord({
    required this.id,
    required this.name,
    required this.uid,
    required this.password,
    required this.twoFactorKey,
    required this.date,
    required this.time,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'uid': uid,
      'password': password,
      'twoFactorKey': twoFactorKey,
      'date': date,
      'time': time,
    };
  }

  factory AccountRecord.fromMap(Map<String, dynamic> map) {
    return AccountRecord(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      uid: map['uid'] ?? '',
      password: map['password'] ?? '',
      twoFactorKey: map['twoFactorKey'] ?? '',
      date: map['date'] ?? '',
      time: map['time'] ?? '',
    );
  }
}`
  },
  {
    name: "database_helper.dart",
    path: "lib/services/database_helper.dart",
    language: "dart",
    content: `import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/account_model.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('rubab_manager.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(path, version: 1, onCreate: _createDB);
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE accounts(
        id TEXT PRIMARY KEY,
        name TEXT,
        uid TEXT,
        password TEXT,
        twoFactorKey TEXT,
        date TEXT,
        time TEXT
      )
    ''');
  }

  Future<int> insertAccount(AccountRecord record) async {
    final db = await instance.database;
    return await db.insert('accounts', record.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<AccountRecord>> fetchAllAccounts() async {
    final db = await instance.database;
    final maps = await db.query('accounts', orderBy: 'date DESC, time DESC');
    return maps.map((map) => AccountRecord.fromMap(map)).toList();
  }
}`
  },
  {
    name: "excel_service.dart",
    path: "lib/services/excel_service.dart",
    language: "dart",
    content: `import 'dart:io';
import 'package:excel/excel.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import '../models/account_model.dart';

class ExcelService {
  static Future<String?> exportToExcel(List<AccountRecord> records) async {
    // Request Storage permissions
    var status = await Permission.storage.request();
    var manageStatus = await Permission.manageExternalStorage.request();
    
    if (!status.isGranted && !manageStatus.isGranted) {
      throw Exception("Storage permission is required to save Excel files.");
    }

    // Initialize Excel Document
    var excel = Excel.createExcel();
    Sheet sheetObject = excel['Sheet1'];
    excel.setDefaultSheet('Sheet1');

    // Styling & Headers
    sheetObject.appendRow([
      TextCellValue('Name'),
      TextCellValue('UID'),
      TextCellValue('Password'),
      TextCellValue('2FA Key'),
      TextCellValue('Date'),
      TextCellValue('Time')
    ]);

    // Add data
    for (var record in records) {
      sheetObject.appendRow([
        TextCellValue(record.name),
        TextCellValue(record.uid),
        TextCellValue(record.password),
        TextCellValue(record.twoFactorKey),
        TextCellValue(record.date),
        TextCellValue(record.time)
      ]);
    }

    // Save File
    Directory? directory;
    if (Platform.isAndroid) {
      directory = Directory('/storage/emulated/0/Download');
      if (!await directory.exists()) {
        directory = await getExternalStorageDirectory();
      }
    } else {
      directory = await getApplicationDocumentsDirectory();
    }

    if (directory == null) return null;

    final filePath = "\${directory.path}/Account_Manager_BD.xlsx";
    final file = File(filePath);

    final bytes = excel.encode();
    if (bytes != null) {
      await file.writeAsBytes(bytes);
      return filePath;
    }
    return null;
  }
}`
  },
  {
    name: "overlay_service.dart",
    path: "lib/services/overlay_service.dart",
    language: "dart",
    content: `import 'package:flutter_overlay_window/flutter_overlay_window.dart';

class OverlayService {
  static Future<void> showFloatingBubble() async {
    bool isGranted = await FlutterOverlayWindow.isPermissionGranted();
    if (!isGranted) {
      isGranted = await FlutterOverlayWindow.requestPermission();
    }
    
    if (isGranted) {
      if (!await FlutterOverlayWindow.isActive()) {
        await FlutterOverlayWindow.showOverlay(
          enableDrag: true,
          overlayTitle: "Rubab Manager Floating",
          overlayContent: "Quick Access overlay active",
          height: 350,
          width: 280,
          alignment: OverlayAlignment.center,
        );
      }
    }
  }

  static Future<void> closeFloatingBubble() async {
    if (await FlutterOverlayWindow.isActive()) {
      await FlutterOverlayWindow.closeOverlay();
    }
  }
}`
  }
];

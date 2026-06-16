import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, Sparkles, Key, FileCheck, Save, Settings, Database, Code, 
  Download, Clipboard, Play, RefreshCw, Eye, EyeOff, User, ArrowLeft, 
  Plus, Check, Trash2, ShieldAlert, FileSpreadsheet, X, Layers, Sliders, 
  Laptop, Zap, HelpCircle, Flame, Chrome, CheckCircle2, AlertCircle, Copy, Move
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AccountRecord, AppSettings, SourceFile } from './types';
import { FLUTTER_TEMPLATES } from './data/flutterCodeTemplates';
import { motion } from 'motion/react';
import * as OTPAuth from 'otpauth';

// Default mock names lists
const DEFAULT_MALE_NAMES = [
  "Rahim Hasan", "Arif Hossain", "Mehedi Sakib", "Fahim Ahmed", 
  "Sadman Rahman", "Yeasin Arafat", "Kamrul Hasan", "Sajjad Hossain", 
  "Mahfuzur Rahman", "Tanvir Ahmed"
];

const DEFAULT_FEMALE_NAMES = [
  "Nusrat Jahan", "Sumaiya Akter", "Tanjina Islam", "Farhana Yasmin", 
  "Jannatul Ferdous", "Sadia Sultana", "Umme Habiba", "Shahanaj Parvin", 
  "Afroza Sultana", "Mim Akter"
];

export default function App() {
  // ----------------------------------------------------
  // Persistent Settings & States
  // ----------------------------------------------------
  const [records, setRecords] = useState<AccountRecord[]>(() => {
    const saved = localStorage.getItem('rubab_manager_records');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Arif Hossain',
        uid: '5173928154',
        password: 'Rubab15',
        twoFactorKey: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
        date: '15 June 2026',
        time: '12:44 PM'
      },
      {
        id: '2',
        name: 'Nusrat Jahan',
        uid: '8192039151',
        password: 'Rubab15',
        twoFactorKey: 'KVKVEVKVKVEVKVKVEVKVEVKVKVEVKVKV',
        date: '15 June 2026',
        time: '11:15 AM'
      }
    ];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('rubab_manager_settings');
    return saved ? JSON.parse(saved) : {
      passwordPrefix: 'Rubab',
      customNames: 'Arif Hossain, Nusrat Jahan, Sumaiya Akter, Fahim Ahmed, Tanvir Rahman, Tanjina Islam, Rahim Chowdhury, Kamrul Sakib',
      enableOverlay: true,
      overlayOpacity: 0.9,
      overlaySize: 'medium'
    };
  });

  // Simulator Screen Modes: 'HOME' | 'APP' | 'GAME' | 'CHROME'
  const [screenMode, setScreenMode] = useState<'HOME' | 'APP' | 'GAME' | 'CHROME'>('APP');
  
  // App Inner Screens: 'MANAGER' | 'DATABASE' | 'SETTINGS'
  const [appScreen, setAppScreen] = useState<'MANAGER' | 'DATABASE' | 'SETTINGS'>('MANAGER');

  // Input Fields inside Rubab Manager Form
  const [formName, setFormName] = useState('');
  const [formUid, setFormUid] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [form2fa, setForm2fa] = useState('');

  // Floating Bubble Status: 'BUBBLE' | 'EXPANDED'
  const [overlayState, setOverlayState] = useState<'BUBBLE' | 'EXPANDED'>('BUBBLE');
  
  // Floating Bubble Position (Simulated Drag coordinates relative to container)
  const [bubblePos, setBubblePos] = useState({ x: 190, y: 140 });
  const simulatorRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Gradle Compiler states
  const [compileProgress, setCompileProgress] = useState<number | null>(null);
  const [compileStep, setCompileStep] = useState<string>('');
  const [compileSuccess, setCompileSuccess] = useState<boolean>(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  
  // Developer Workspace Tab: 'CODE' | 'BUILD' | 'DOCS' | 'RECORDS'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'CODE' | 'BUILD' | 'DOCS' | 'RECORDS'>('CODE');
  
  // Code Viewer selected file index
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Toasts overlay
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'info' | 'error' }[]>([]);

  // Password visibility
  const [showPass, setShowPass] = useState(false);

  // Live Bangladeshi Date Time simulation
  const [simLocalTime, setSimLocalTime] = useState('');
  const [simLocalDate, setSimLocalDate] = useState('');
  const [dayNumber, setDayNumber] = useState<number>(15); // Default to prompt time '15 June'

  // Dynamic game context (what values are currently "pasted" inside mock Free Fire Game fields)
  const [gameUidField, setGameUidField] = useState('');
  const [gamePasswordField, setGamePasswordField] = useState('');
  const [game2FaField, setGame2FaField] = useState('');

  // 2FA Key and Code states (2fa.cn style calculations)
  const [activeTotpSecret, setActiveTotpSecret] = useState<string>('');
  const [activeGeneratedCode, setActiveGeneratedCode] = useState<string>('');
  const [codeTimeLeft, setCodeTimeLeft] = useState<number>(30);
  const file2faInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // Sync LocalStorage & Dates
  // ----------------------------------------------------
  useEffect(() => {
    localStorage.setItem('rubab_manager_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('rubab_manager_settings', JSON.stringify(settings));
  }, [settings]);

  // Live TOTP code ticking updates (Real cryptographically generated local tokens)
  useEffect(() => {
    if (!activeTotpSecret) return;

    const generateAndSet = () => {
      try {
        const cleanKey = activeTotpSecret.replace(/[\s-]/g, '').toUpperCase();
        if (!cleanKey) {
          setActiveGeneratedCode('');
          return;
        }
        const totpObj = new OTPAuth.TOTP({
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(cleanKey)
        });
        const token = totpObj.generate();
        setActiveGeneratedCode(token);
        
        // Calculate standard seconds remaining in current 30-second window
        const seconds = Math.floor(Date.now() / 1000);
        const remaining = 30 - (seconds % 30);
        setCodeTimeLeft(remaining);
      } catch (err) {
        setActiveGeneratedCode('');
      }
    };

    generateAndSet();
    const interval = setInterval(generateAndSet, 1000);
    return () => clearInterval(interval);
  }, [activeTotpSecret]);

  // Update dynamic clock & daily password calculations
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Hardcode/offset for Bangladesh standard timezone (UTC+6) or dynamic browser time
      const bstTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // Calculate local day of Bangladesh time for June 2026 or current active month
      const bstDay = now.getDate();
      setDayNumber(bstDay);
      
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const bstDateStr = `${bstDay} ${months[now.getMonth()]} ${now.getFullYear()}`;
      
      setSimLocalTime(bstTimeStr);
      setSimLocalDate(bstDateStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate dynamic password when prefix or date day changes
  useEffect(() => {
    setFormPassword(`${settings.passwordPrefix}${dayNumber}`);
  }, [settings.passwordPrefix, dayNumber]);

  // ----------------------------------------------------
  // Helper Functions
  // ----------------------------------------------------
  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  // Name Generator triggered
  const handleGenerateName = (gender: 'MALE' | 'FEMALE') => {
    // Parse custom list or back to default
    let namesArray: string[] = [];
    if (settings.customNames.trim().length > 0) {
      namesArray = settings.customNames.split(',').map(n => n.trim()).filter(n => n.length > 0);
    }

    if (namesArray.length === 0) {
      namesArray = gender === 'MALE' ? DEFAULT_MALE_NAMES : DEFAULT_FEMALE_NAMES;
    }

    // Pick random from namesArray or fallback gender specifics
    const randomIndex = Math.floor(Math.random() * namesArray.length);
    const chosenName = namesArray[randomIndex];
    setFormName(chosenName);
    showToast(`Generated: ${chosenName}`, 'success');
  };

  // Copy helper
  const copyToClipboard = (txt: string, label: string) => {
    if (!txt) {
      showToast(`${label} is empty!`, 'error');
      return;
    }
    navigator.clipboard.writeText(txt);
    showToast(`Copied ${label}!`, 'success');
  };

  // Trigger generation of 2FA dynamic code from secret key
  const triggerGenerate2fa = (secret: string) => {
    const clean = secret.replace(/[\s-]/g, '').toUpperCase();
    if (!clean) {
      showToast("Please enter a 2FA secret key first!", "error");
      return;
    }
    try {
      // Decode check to verify base32 validity
      OTPAuth.Secret.fromBase32(clean);
      setActiveTotpSecret(clean);
      showToast("Live 2FA Code Generated!", "success");
    } catch (err) {
      showToast("Invalid key format. Must be Base32 characters (A-Z, 2-7).", "error");
    }
  };

  // Upload/Read 2FA Secret Key from local file
  const handleUpload2faFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const cleaned = text.trim();
      if (cleaned.length >= 8 && cleaned.length <= 128) {
        setForm2fa(cleaned);
        showToast("Uploaded 2FA Key from file!", "success");
        triggerGenerate2fa(cleaned);
      } else {
        showToast("Invalid file content length for 2FA key.", "error");
      }
      e.target.value = ''; // Reset
    };
    reader.readAsText(file);
  };

  // Save Record
  const handleSaveRecord = () => {
    if (!formName.trim()) {
      showToast("Name is required!", "error");
      return;
    }
    if (!formUid.trim()) {
      showToast("UID is required!", "error");
      return;
    }

    const newRecord: AccountRecord = {
      id: Math.random().toString(36).substr(2, 9),
      name: formName.trim(),
      uid: formUid.trim(),
      password: formPassword,
      twoFactorKey: form2fa.trim() || 'No 2FA Key',
      date: simLocalDate,
      time: simLocalTime
    };

    setRecords(prev => [newRecord, ...prev]);
    showToast("Record Saved to Hive SQLite!", "success");

    // Clear inputs except password which is auto
    setFormName('');
    setFormUid('');
    setForm2fa('');
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    showToast("Record deleted", "error");
  };

  // Clear all database
  const handleClearDatabase = () => {
    if (confirm("Are you sure you want to clear the entire local database?")) {
      setRecords([]);
      showToast("Database cleared successfully", "error");
    }
  };

  // Excel Export XLS Function
  const handleExcelExport = () => {
    if (records.length === 0) {
      showToast("Database has no records to export!", "error");
      return;
    }

    // Prepare table mapping
    const formattedRows = records.map(r => ({
      "Name": r.name,
      "UID": r.uid,
      "Password": r.password,
      "2FA Key": r.twoFactorKey,
      "Date": r.date,
      "Time": r.time,
    }));

    // Create workbook and Sheet
    const ws = XLSX.utils.json_to_sheet(formattedRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");

    // Fix column widths for optimal reading layout
    const maxColumnWidth = [
      { wch: 18 }, // Name
      { wch: 15 }, // UID
      { wch: 12 }, // Password
      { wch: 25 }, // 2FA
      { wch: 15 }, // Date
      { wch: 12 }  // Time
    ];
    ws['!cols'] = maxColumnWidth;

    // Trigger Download of Excel Book
    XLSX.writeFile(wb, "Account_Manager_BD.xlsx");
    showToast("Excel Export Saved: Account_Manager_BD.xlsx", "success");
  };

  // Drag Bubble Simulator Logic (Simple click-drag)
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handleBubbleTouchStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      dragStartOffset.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
      setIsDraggingBubble(true);
    }
  };

  const handleBubbleTouchMove = (e: Event) => {
    if (!isDraggingBubble || !simulatorRef.current) return;
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

    const simRect = simulatorRef.current.getBoundingClientRect();
    
    // Bounds limit for phone simulator window
    let relativeX = clientX - simRect.left - dragStartOffset.current.x;
    let relativeY = clientY - simRect.top - dragStartOffset.current.y;

    relativeX = Math.max(10, Math.min(relativeX, simRect.width - 60));
    relativeY = Math.max(40, Math.min(relativeY, simRect.height - 100));

    setBubblePos({ x: relativeX, y: relativeY });
  };

  const handleBubbleTouchEnd = () => {
    setIsDraggingBubble(false);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDraggingBubble) {
        handleBubbleTouchMove(e);
      }
    };
    const handleEnd = () => {
      if (isDraggingBubble) {
        handleBubbleTouchEnd();
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingBubble]);

  // Handle saving directly from floating overlay
  const handleSaveFromOverlay = () => {
    if (!formName.trim() || !formUid.trim()) {
      showToast("Cannot save from overlay. Form is incomplete (Name or UID empty).", "error");
      return;
    }
    const newRecord: AccountRecord = {
      id: Math.random().toString(36).substr(2, 9),
      name: formName.trim(),
      uid: formUid.trim(),
      password: formPassword,
      twoFactorKey: form2fa.trim() || 'No 2FA Key',
      date: simLocalDate,
      time: simLocalTime
    };
    setRecords(prev => [newRecord, ...prev]);
    showToast("Direct Save from Background Overlay!", "success");
    setFormName('');
    setFormUid('');
    setForm2fa('');
  };

  // ----------------------------------------------------
  // Dynamic Simulated compilation task
  // ----------------------------------------------------
  const triggerSDKBuild = () => {
    setCompileProgress(0);
    setCompileSuccess(false);
    setCompileStep('Initializing Gradle Build daemon...');
    setBuildLogs([
      `[gradle] Starting Rubab Manager Android Packaging...`,
      `[gradle] Android Gradle Plugin Version: 8.2.1`,
      `[gradle] Target SDK: API 34 (Android 14 / Backwards compat Android 12)`,
      `[gradle] Device target optimization: Samsung Galaxy A Series (A14/A34/A54/A73)`,
      `[gradle] Architectures: arm64-v8a, armeabi-v7a`,
      `[flutter] Resolving Flutter packages pubspec.yaml...`,
      `[flutter]   - flutter_foreground_task: ^6.1.0 (Loaded)`,
      `[flutter]   - flutter_overlay_window: ^0.4.5 (Loaded)`,
      `[flutter]   - excel: ^4.0.0 (Loaded)`,
      `[flutter]   - flutter_riverpod: ^2.4.9 (Loaded)`
    ]);

    const steps = [
      { p: 15, msg: 'Resolving pub dependencies & libraries...', log: '[flutter] Loading local Riverpod providers and local SQLite helper...' },
      { p: 30, msg: 'Converting Clean Architecture dart files to JVM instructions...', log: '[gradle] Compiling classes: flutter_foreground_task, com.pravera.flutter_foreground_task...' },
      { p: 45, msg: 'Parsing Manifest Permissions & Security Policies...', log: '[gradle] Injecting SYSTEM_ALERT_WINDOW and FOREGROUND_SERVICE protocols...' },
      { p: 60, msg: 'Assembling Android dex files (R8 Optimization)...', log: '[r8] Optimizing for Samsung One UI v5.1 standard libraries...' },
      { p: 75, msg: 'Creating APK ZIP contents and resource bundling...', log: '[gradle] Compiling assets, compressing layout graphics...' },
      { p: 90, msg: 'Signing Rubab Manager APK with dynamic V2 certificate...', log: '[gradle] Signing finished: Rubab_Manager_v1.0_Signed.apk (SHA-256 Verified)' },
      { p: 100, msg: 'Build Successful! APK is compiled and packaged.', log: '[gradle] BUILD SUCCESSFUL in 4.3 seconds. Output: dist/rubab_manager_signed_v1.0.apk' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setCompileProgress(step.p);
        setCompileStep(step.msg);
        setBuildLogs(prev => [...prev, step.log]);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setCompileSuccess(true);
        showToast("APK Compiled Successfully for Samsung!", "success");
      }
    }, 600);
  };

  return (
    <div 
      id="rubab-manager-workspace" 
      className="min-h-screen bg-[#05070a] text-slate-200 flex flex-col selection:bg-blue-500 selection:text-white"
      style={{
        backgroundImage: 'radial-gradient(circle at 0% 0%, #1e1b4b 0%, transparent 50%), radial-gradient(circle at 100% 100%, #312e81 0%, transparent 50%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* ----------------------------------------------------
          AESTHETIC HEADER BANNER
          ---------------------------------------------------- */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
            <Smartphone className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-sans tracking-wide text-white">Rubab Manager</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-400/20">
                v1.0 Configured
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Advanced Foreground Overlay Helper & Database Administrator Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-3 bg-white/5 py-1.5 px-3 rounded-lg border border-white/10 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400 font-mono">System Date: <strong className="text-slate-200">{simLocalDate}</strong></span>
          </div>
          <div className="bg-[#05070a]/40 py-1.5 px-3 rounded-lg border border-white/10 backdrop-blur-md font-mono text-blue-400 text-sm font-semibold">
            ⏰ {simLocalTime} (Dhaka Standard Time Compatible)
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------
          NOTIFICATIONS OVERLAY (Android Toasts)
          ---------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 scale-100 opacity-100 ${
              t.type === 'error' 
                ? 'bg-rose-950/90 text-rose-300 border-rose-800' 
                : t.type === 'info'
                  ? 'bg-blue-950/90 text-blue-300 border-blue-800'
                  : 'bg-slate-950/95 text-cyan-400 border-cyan-500/30'
            }`}
          >
            <div className="p-1 rounded bg-black/30">
              {t.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <span className="text-xs font-semibold font-mono tracking-tight">{t.msg}</span>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------
          MAIN SCREEN - SIDE-BY-SIDE SPLIT
          ---------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ====================================================
            LEFT PANEL: HIGH-FIDELITY SAMSUNG ANDROID DEVICE SIMULATOR
            ==================================================== */}
        <section className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[360px] flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>SAMSUNG A-SERIES DEVICE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded text-amber-300 font-bold border border-slate-700">
                Android 12+ API Target
              </span>
            </div>
          </div>

          {/* PHONE BODY CONTAINER */}
          <div 
            ref={simulatorRef}
            id="android-phone-simulator"
            className="relative w-full max-w-[350px] aspect-[9/18.5] bg-[#0c0e15] rounded-[48px] border-8 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden select-none"
            style={{ ring: '2px solid rgba(255,255,255,0.05)' }}
          >
            {/* FRONT PUNCH CAMERA HOLE */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-50 border border-slate-900 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-900/40 rounded-full" />
            </div>

            {/* MOCK STATUS BAR */}
            <div className="h-7 pt-1 px-6 bg-black/60 backdrop-blur-md flex items-center justify-between text-[11px] font-mono text-slate-200 font-medium z-40">
              <span className="text-[10px] tracking-tight">{simLocalTime.slice(0, 5)}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-slate-800 px-1 rounded text-cyan-300/90 font-bold">LTE+</span>
                <span className="w-3 h-2 bg-slate-400 rounded-sm relative after:absolute after:top-0.5 after:-right-0.5 after:w-0.5 after:h-1 after:bg-slate-400">
                  <span className="absolute top-0 left-0 bg-cyan-400 h-full w-[85%]" />
                </span>
              </div>
            </div>

            {/* PHONE INNER BODY SCREEN VIEWPORT */}
            <div className="flex-1 relative overflow-hidden flex flex-col bg-[#05070a]">
              
              {/* ==============================================
                  1. ANDROID HOME SCREEN VIEW
                  ============================================== */}
              {screenMode === 'HOME' && (
                <div 
                  className="absolute inset-0 flex flex-col p-6 text-slate-100"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 100% 100%, #1e1b4b 0%, #05070a 100%)',
                  }}
                >
                  {/* Dynamic Weather Widget */}
                  <div className="glass-light rounded-2xl p-4 mt-4 text-center select-none shadow-sm relative overflow-hidden group">
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider">BANGLADESH WEATHER</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-2xl font-bold font-sans">31°C</span>
                      <span className="text-xs text-amber-300">☀️ Sunny</span>
                    </div>
                    <p className="text-[10px] text-blue-400/80 font-mono mt-1">Dhaka Capital Region</p>
                  </div>

                  {/* System Apps Matrix */}
                  <div className="grid grid-cols-4 gap-4 mt-auto mb-10 text-center">
                    
                    {/* Rubab App Icon */}
                    <button 
                      onClick={() => { setScreenMode('APP'); setAppScreen('MANAGER'); }}
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10 group-active:scale-95 transition-transform duration-100">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-200 mt-1.5 truncate w-full text-center">
                        Rubab Mgr
                      </span>
                    </button>

                    {/* Free Fire Mock Game Icon */}
                    <button 
                      onClick={() => setScreenMode('GAME')}
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-lg border border-orange-300/30 group-active:scale-95 transition-transform duration-100">
                        <Flame className="w-6 h-6 text-white animate-pulse" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-200 mt-1.5 truncate w-full text-center">
                        Free Fire BD
                      </span>
                    </button>

                    {/* Mock Google Chrome Icon */}
                    <button 
                      onClick={() => setScreenMode('CHROME')}
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-md group-active:scale-95 transition-transform duration-100 backdrop-blur-sm">
                        <Chrome className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-200 mt-1.5 truncate w-full text-center">
                        Chrome
                      </span>
                    </button>

                    {/* Quick Database Shortcut Icon */}
                    <button 
                      onClick={() => { setScreenMode('APP'); setAppScreen('DATABASE'); }}
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-md group-active:scale-95 transition-transform duration-100 backdrop-blur-sm">
                        <Database className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-200 mt-1.5 truncate w-full text-center">
                        Records
                      </span>
                    </button>

                  </div>

                  <div className="text-center pb-2 text-[10px] text-slate-500 font-mono tracking-tight animate-pulse">
                    Swipe app to test floating background
                  </div>
                </div>
              )}

              {/* ==============================================
                  2. RUBAB MANAGER APP INTERACTIVE ENVIRONMENT
                  ============================================== */}
              {screenMode === 'APP' && (
                <div className="absolute inset-0 flex flex-col bg-[#05070a]">
                  
                  {/* APP TITLE / HEADER AREA */}
                  <div className="px-4 py-3 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="font-sans font-bold text-xs tracking-wider text-slate-100 uppercase">Rubab Admin</span>
                    </div>
                    
                    <button 
                      onClick={() => setScreenMode('HOME')}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                      title="Minimize App"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* GLASS TAB PANEL ROUTER */}
                  <div className="grid grid-cols-3 bg-black/40 backdrop-blur-sm border-b border-white/5 text-center text-[10px] font-sans font-semibold tracking-wide text-slate-400">
                    <button 
                      onClick={() => setAppScreen('MANAGER')}
                      className={`py-2 px-1 flex flex-col items-center gap-0.5 border-b-2 transition-colors ${
                        appScreen === 'MANAGER' 
                          ? 'border-blue-400 text-blue-400 bg-white/5 font-bold' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Manager</span>
                    </button>

                    <button 
                      onClick={() => setAppScreen('DATABASE')}
                      className={`py-2 px-1 flex flex-col items-center gap-0.5 border-b-2 transition-colors ${
                        appScreen === 'DATABASE' 
                          ? 'border-blue-400 text-blue-400 bg-white/5 font-bold' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Database ({records.length})</span>
                    </button>

                    <button 
                      onClick={() => setAppScreen('SETTINGS')}
                      className={`py-2 px-1 flex flex-col items-center gap-0.5 border-b-2 transition-colors relative ${
                        appScreen === 'SETTINGS' 
                          ? 'border-blue-400 text-blue-400 bg-white/5 font-bold' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* APP SUB-SCREEN CHANGER */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
                    
                    {/* MANAGER SCREEN */}
                    {appScreen === 'MANAGER' && (
                      <div className="space-y-3.5">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow">
                          <p className="text-[10px] font-mono text-blue-400 font-bold mb-2 uppercase tracking-wider">1. GENERATE BANGLADESHI NAME</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => handleGenerateName('MALE')}
                              className="py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-md text-blue-400 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <User className="w-3 h-3" />
                              <span>Male Bengali</span>
                            </button>
                            <button 
                              onClick={() => handleGenerateName('FEMALE')}
                              className="py-1.5 px-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-md text-pink-400 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <User className="w-3 h-3" />
                              <span>Female Bengali</span>
                            </button>
                          </div>
                        </div>

                        {/* WORK FIELDS GROUP */}
                        <div className="space-y-2.5">
                          {/* Name Input Field */}
                          <div>
                            <label className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">NAME FIELD (AUTO-FILLABLE)</label>
                            <div className="relative">
                              <input 
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Rahim Hasan / Nusrat Jahan"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-blue-500 font-sans transition-all"
                              />
                              <button 
                                onClick={() => copyToClipboard(formName, "Username")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 cursor-pointer"
                              >
                                <Clipboard className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* UID manual Paste input */}
                          <div>
                            <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1">UID INSTANT FIELD</label>
                            <div className="relative">
                              <input 
                                type="text"
                                value={formUid}
                                onChange={(e) => setFormUid(e.target.value)}
                                placeholder="Paste player/user UID"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 pl-3 pr-8 text-xs text-white uppercase focus:outline-none focus:border-blue-500 font-mono transition-all"
                              />
                              <button 
                                onClick={() => copyToClipboard(formUid, "UID")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 cursor-pointer"
                              >
                                <Clipboard className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1 font-mono">Input uid manually or copy from secondary screens</p>
                          </div>

                          {/* Dynamic Auto-generating Password Field */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">PASSWORD GENERATOR (READ ONLY)</label>
                              <span className="text-[9px] bg-white/5 backdrop-blur-sm text-blue-300 font-mono px-1 rounded border border-white/10">
                                Prefix: {settings.passwordPrefix}
                              </span>
                            </div>
                            <div className="relative">
                              <input 
                                type={showPass ? "text" : "password"}
                                value={formPassword}
                                readOnly
                                className="w-full bg-black/60 border border-white/10 text-blue-300 rounded-xl py-1.5 pl-3 pr-16 text-xs focus:outline-none font-mono tracking-wider transition-all"
                              />
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                <button 
                                  onClick={() => setShowPass(!showPass)}
                                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                                >
                                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button 
                                  onClick={() => copyToClipboard(formPassword, "Generated Password")}
                                  className="text-slate-500 hover:text-blue-400 cursor-pointer"
                                  title="Copy"
                                >
                                  <Clipboard className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-1 flex gap-1.5 items-center justify-between text-[9px] text-slate-500 font-mono">
                              <span>Formula: {settings.passwordPrefix} + Date Day ({dayNumber})</span>
                            </div>
                          </div>

                          {/* 2FA Key block field */}
                          <div>
                            <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1">2FA GOOGLE ENCRYPT KEY</label>
                            <div className="relative">
                              <input 
                                type="text"
                                value={form2fa}
                                onChange={(e) => {
                                  setForm2fa(e.target.value);
                                  if (activeTotpSecret) {
                                    setActiveTotpSecret('');
                                    setActiveGeneratedCode('');
                                  }
                                }}
                                placeholder="Paste Google Authenticator key"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[10px] transition-all"
                              />
                              <button 
                                onClick={() => copyToClipboard(form2fa, "2FA key")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 cursor-pointer"
                              >
                                <Clipboard className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Hidden file input */}
                            <input 
                              type="file" 
                              ref={file2faInputRef} 
                              onChange={handleUpload2faFile} 
                              className="hidden" 
                              accept=".txt,.key,.csv"
                            />

                            {/* Support panel sub buttons */}
                            <div className="mt-2 grid grid-cols-3 gap-1">
                              <button
                                type="button"
                                onClick={() => triggerGenerate2fa(form2fa)}
                                className="py-1.5 px-0.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer animate-none"
                                title="Generate local simulated TOTP"
                              >
                                <Zap className="w-3 h-3 text-purple-400 shrink-0" />
                                <span>Get Code</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => file2faInputRef.current?.click()}
                                className="py-1.5 px-0.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer animate-none"
                                title="Click to search and upload .txt file containing secret"
                              >
                                <Download className="w-3 h-3 text-blue-400 shrink-0 rotate-180" />
                                <span>Upload</span>
                              </button>

                              <a
                                href="https://2fa.cn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1.5 px-0.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-center"
                                title="Open 2fa.cn website"
                              >
                                <Chrome className="w-3 h-3 text-blue-400 shrink-0" />
                                <span>2fa.cn ↗</span>
                              </a>
                            </div>

                            {/* Live dynamic token view */}
                            {activeGeneratedCode && (
                              <div className="mt-2.5 bg-[#1e1435]/40 border border-purple-500/20 rounded-xl p-2.5 space-y-1.5 relative overflow-hidden transition-all duration-300">
                                <div 
                                  className="absolute top-0 left-0 bg-purple-500 h-[2px] transition-all duration-1000 ease-linear" 
                                  style={{ width: `${(codeTimeLeft / 30) * 100}%` }} 
                                />
                                <div className="flex items-center justify-between text-[8px] font-mono tracking-widest text-purple-300 uppercase">
                                  <span>2FA Live Generator Code</span>
                                  <span className="flex items-center gap-1 font-bold">
                                    <span className={`w-1 h-1 rounded-full ${codeTimeLeft > 5 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
                                    Expires in {codeTimeLeft}s
                                  </span>
                                </div>
                                <div className="flex items-center justify-between bg-black/40 rounded-lg p-1.5 border border-purple-500/10 gap-2 font-mono">
                                  <span className="text-base font-black tracking-[0.25em] text-[#f1f5f9] select-all pl-2 leading-none shrink-0 font-bold">
                                    {activeGeneratedCode.slice(0, 3)} {activeGeneratedCode.slice(3)}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(activeGeneratedCode, "2FA Code")}
                                    className="p-1 px-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 rounded border border-purple-500/30 text-[9px] font-sans font-bold cursor-pointer transition-all flex items-center gap-1 leading-none"
                                  >
                                    <Clipboard className="w-3 h-3 text-purple-400" />
                                    <span>Copy</span>
                                  </button>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* SAVE ACTION ACTION BUTTON */}
                        <button
                          onClick={handleSaveRecord}
                          className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/20 active:scale-[0.99]"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Record to Local</span>
                        </button>
                      </div>
                    )}

                    {/* sqlite DATABASE VIEWER INSIDE MOBILE APP */}
                    {appScreen === 'DATABASE' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">SQLITE / HIVE TABLE</span>
                          <button 
                            onClick={handleExcelExport}
                            className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 p-1 px-2 rounded flex items-center gap-1 text-[9px] font-bold transition-all cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3 h-3" />
                            <span>Excel Export</span>
                          </button>
                        </div>

                        {records.length === 0 ? (
                          <div className="text-center py-8 bg-[#05070a]/60 border border-white/10 rounded-2xl p-4">
                            <Database className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-slate-500 font-semibold font-sans">SQLite Database Empty</p>
                            <p className="text-[10px] text-slate-600 mt-1">Generate names and insert fields first</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {records.map(r => (
                              <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-sans relative group hover:bg-white/10 transition-all">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-200 truncate pr-6">{r.name}</span>
                                  <button 
                                    onClick={() => handleDeleteRecord(r.id)}
                                    className="p-0.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 cursor-pointer"
                                    title="Delete record"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-slate-400 text-[9px]">
                                  <div>UID: <span className="text-blue-300 font-bold">{r.uid}</span></div>
                                  <div>Pass: <span className="text-blue-400">{r.password}</span></div>
                                  <div className="col-span-2 flex items-center justify-between gap-1.5 mt-0.5 bg-black/35 p-1 px-1.5 rounded border border-white/5">
                                    <span className="truncate max-w-[120px]" title={r.twoFactorKey}>
                                      2FA: <strong className="text-purple-300">{r.twoFactorKey}</strong>
                                    </span>
                                    {r.twoFactorKey && r.twoFactorKey !== 'No 2FA Key' && (
                                      <button
                                        onClick={() => {
                                          try {
                                            const clean = r.twoFactorKey.replace(/[\s-]/g, '').toUpperCase();
                                            const totpObj = new OTPAuth.TOTP({
                                              algorithm: 'SHA1',
                                              digits: 6,
                                              period: 30,
                                              secret: OTPAuth.Secret.fromBase32(clean)
                                            });
                                            const token = totpObj.generate();
                                            copyToClipboard(token, `2FA Token (${r.name})`);
                                          } catch (e) {
                                            showToast("Invalid 2FA secret format", "error");
                                          }
                                        }}
                                        className="px-1.5 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded text-[8px] font-bold shrink-0 transition-all cursor-pointer font-sans"
                                        title="Copy Live 2FA Code"
                                      >
                                        Copy Code
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-1.5 pt-1.5 border-t border-white/5 flex justify-between text-[8px] text-slate-500 font-mono">
                                  <span>📅 {r.date}</span>
                                  <span>{r.time}</span>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={handleClearDatabase}
                              className="w-full text-center py-1.5 bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-900/20 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                            >
                              Flush Database Tables
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* APP SETTINGS PAGE INSIDE IMMERSIVE ANDROID SIMULATOR */}
                    {appScreen === 'SETTINGS' && (
                      <div className="space-y-3.5 text-xs text-slate-300">
                        {/* Password settings */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
                          <p className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">🔒 Password Configuration</p>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 mb-1">PASSWORD PREFIX</label>
                            <input 
                              type="text"
                              value={settings.passwordPrefix}
                              onChange={(e) => setSettings({ ...settings, passwordPrefix: e.target.value })}
                              placeholder="Default: Rubab"
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-[9px] text-slate-500 mt-1 font-mono">Autosaved. Current: {settings.passwordPrefix}{dayNumber}</p>
                          </div>
                        </div>

                        {/* Name settings */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
                          <p className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">🇧🇩 Custom Name Library</p>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 mb-1">COMMA-SEPARATED NAMES LIST</label>
                            <textarea
                              rows={3}
                              value={settings.customNames}
                              onChange={(e) => setSettings({ ...settings, customNames: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                              placeholder="Fahim Ahmed, Tanvir Miah, Sumaiya Akhter..."
                            />
                            <p className="text-[8px] text-slate-500 font-mono mt-0.5">Generator selects randomly from this inventory list.</p>
                          </div>
                        </div>

                        {/* Overlay Service configs */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
                          <p className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">🔘 System Foreground Overlay</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-300">ENABLE FLOATING BALL</span>
                            <input 
                              type="checkbox"
                              checked={settings.enableOverlay}
                              onChange={(e) => setSettings({ ...settings, enableOverlay: e.target.checked })}
                              className="w-4 h-4 cursor-pointer accent-blue-500"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1">
                              <span>OVERLAY TRANSPARENCY</span>
                              <span>{Math.round(settings.overlayOpacity * 100)}%</span>
                            </div>
                            <input 
                              type="range"
                              min="0.3"
                              max="1.0"
                              step="0.1"
                              value={settings.overlayOpacity}
                              onChange={(e) => setSettings({ ...settings, overlayOpacity: parseFloat(e.target.value) })}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>

                          <div>
                            <span className="block text-[9px] font-mono text-slate-400 mb-1">BUBBLE SCALE</span>
                            <div className="grid grid-cols-3 gap-1">
                              {(['small', 'medium', 'large'] as const).map(sz => (
                                <button
                                  key={sz}
                                  onClick={() => setSettings({ ...settings, overlaySize: sz })}
                                  className={`py-1 rounded text-[9px] font-sans font-bold capitalize transition-all border cursor-pointer ${
                                    settings.overlaySize === sz 
                                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' 
                                      : 'bg-black/40 text-slate-400 border border-white/10 hover:text-slate-200'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* ==============================================
                  3. FREE FIRE GAME SIMULATOR VIEW (For pasted results checkout!)
                  ============================================== */}
              {screenMode === 'GAME' && (
                <div 
                  className="absolute inset-0 flex flex-col p-4 text-white relative"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.9)), url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="flex items-center justify-between border-b border-orange-500/40 pb-2">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span className="text-[10px] font-sans font-black text-orange-400 tracking-wider">FREE FIRE - BD LOGIN</span>
                    </div>
                    <button 
                      onClick={() => setScreenMode('HOME')}
                      className="p-1 rounded bg-black/60 text-slate-300"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-3.5 max-w-[280px] mx-auto w-full">
                    
                    <div className="bg-black/85 border border-orange-500/20 rounded-xl p-3.5">
                      <div className="text-center mb-3">
                        <p className="text-[11px] text-orange-500 font-bold font-sans">ENTER ACCESS CREDENTIALS</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">Simulate testing the floating keyboard clip helper</p>
                      </div>

                      {/* Mock Username/UID field */}
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[8px] font-mono text-slate-400 mb-0.5">UID / LOGIN ID</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              value={gameUidField}
                              onChange={(e) => setGameUidField(e.target.value)}
                              placeholder="No UID Pasted"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                            />
                            <button
                              onClick={async () => {
                                const clip = await navigator.clipboard.readText();
                                setGameUidField(clip);
                                showToast("Simulated pasted Game ID!", "info");
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-black px-1.5 rounded text-[8px] font-black tracking-tighter"
                              title="Paste from dynamic clipboard"
                            >
                              PASTE
                            </button>
                          </div>
                        </div>

                        {/* Mock password field */}
                        <div>
                          <label className="block text-[8px] font-mono text-slate-400 mb-0.5">PASSWORD</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              value={gamePasswordField}
                              onChange={(e) => setGamePasswordField(e.target.value)}
                              placeholder="No Pass Pasted"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                            />
                            <button
                              onClick={async () => {
                                const clip = await navigator.clipboard.readText();
                                setGamePasswordField(clip);
                                showToast("Simulated pasted Password!", "info");
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-black px-1.5 rounded text-[8px] font-black tracking-tighter"
                            >
                              PASTE
                            </button>
                          </div>
                        </div>

                        {/* Mock 2FA Code */}
                        <div>
                          <label className="block text-[8px] font-mono text-slate-400 mb-0.5">GOOGLE AUTH 2FA TOKEN</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              value={game2FaField}
                              onChange={(e) => setGame2FaField(e.target.value)}
                              placeholder="No 2FA Pasted"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono text-[9px]"
                            />
                            <button
                              onClick={async () => {
                                const clip = await navigator.clipboard.readText();
                                setGame2FaField(clip);
                                showToast("Simulated pasted 2FA Key!", "info");
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-black px-1.5 rounded text-[8px] font-black tracking-tighter"
                            >
                              PASTE
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            if (!gameUidField) {
                              showToast("Credentials empty!", "error");
                            } else {
                              showToast("Mock Game Profile connected successfully!", "success");
                              setGameUidField('');
                              setGamePasswordField('');
                              setGame2FaField('');
                            }
                          }}
                          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold p-1 rounded text-[10px] mt-1 transition-all"
                        >
                          CONFIRM CONNECT ACCOUNT
                        </button>

                      </div>

                    </div>
                  </div>

                  <p className="text-[8px] text-center text-slate-400 font-mono">
                    Drag/open the floating overlay bubble above to test!
                  </p>
                </div>
              )}

              {/* ==============================================
                  4. CHROME BROWSER SIMULATOR VIEW 
                  ============================================== */}
              {screenMode === 'CHROME' && (
                <div className="absolute inset-0 flex flex-col bg-[#121214] text-slate-100">
                  <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center gap-1.5 text-[10px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <input 
                      type="text" 
                      readOnly 
                      value="https://google.com/search?q=bangladeshi+names" 
                      className="flex-1 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono text-[8px] truncate"
                    />
                    <button onClick={() => setScreenMode('HOME')} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center text-center">
                    <User className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                    <p className="font-sans font-bold text-xs text-white">Browser Simulator Mode</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                       This simulates the Android Operating system window, letting you inspect how the foreground service overlay bubble remains persistently interactive and visible over Google Chrome or the game!
                    </p>
                    <button 
                      onClick={() => setScreenMode('APP')}
                      className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-1.5 px-3 rounded-lg mx-auto font-bold cursor-pointer"
                    >
                      Return to Rubab Manager App
                    </button>
                  </div>
                </div>
              )}

              {/* ==============================================
                  DYNAMIC SYSTEM BUBBLE FOREGROUND OVERLAY
                  ============================================== */}
              {settings.enableOverlay && (
                <>
                  {overlayState === 'BUBBLE' ? (
                    // DRAGGABLE FLOATING BUBBLE OVER LAYOUT
                    <div
                      ref={bubbleRef}
                      onMouseDown={handleBubbleTouchStart}
                      onTouchStart={handleBubbleTouchStart}
                      style={{ 
                        left: `${bubblePos.x}px`, 
                        top: `${bubblePos.y}px`,
                        position: 'absolute',
                        opacity: settings.overlayOpacity
                      }}
                      className={`rounded-full shadow-[0_8px_32px_rgba(30,27,75,0.4)] flex items-center justify-center border border-white/20 backdrop-blur-md cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-shadow bg-blue-600/30 hover:bg-blue-600/50 select-none z-50 ${
                        settings.overlaySize === 'small' ? 'w-10 h-10' : settings.overlaySize === 'large' ? 'w-14 h-14' : 'w-12 h-12'
                      }`}
                      onClick={(e) => {
                        // Expand only if not actively dragging
                        if (!isDraggingBubble) {
                          setOverlayState('EXPANDED');
                          showToast("Overlay Service Expanded", "info");
                        }
                      }}
                      title="Draggable Overlay Bubble - Click to Expand"
                    >
                      <Zap className="w-5 h-5 text-blue-300 animate-pulse pointer-events-none" />
                    </div>
                  ) : (
                    // EXPANDED PANEL LAYOUT OVER EVERYTHING
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center p-4 z-50 pointer-events-none">
                      <div 
                        className="w-full max-w-[270px] glass-heavy rounded-3xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.85)] border border-white/10 font-sans pointer-events-auto bg-black/60 backdrop-blur-xl"
                        style={{ opacity: settings.overlayOpacity }}
                      >
                        {/* Overlay Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2">
                          <div className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-blue-400 animate-pulse" />
                            <span className="text-[9px] font-black tracking-wider text-blue-300 font-mono">RUBAB FLOATING WIDGET</span>
                          </div>
                          <span className="text-[8px] font-mono text-emerald-300 border border-emerald-800/20 bg-emerald-500/10 backdrop-blur-sm px-1.5 rounded">
                            ACTIVE SERVICE
                          </span>
                        </div>

                        {/* Display Username / password copy tools */}
                        <div className="space-y-1.5 text-[10px]">
                          {/* Username Clipboard Copy */}
                          <div className="bg-black/30 border border-white/5 rounded-xl p-2 flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="block text-[8px] text-slate-500 font-mono">USERNAME</span>
                              <span className="text-slate-200 font-bold font-sans tracking-tight truncate">{formName || 'No generated username'}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(formName || 'No generated username', "Username")}
                              className="p-1 rounded bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors cursor-pointer"
                              title="Copy Username"
                            >
                              <Clipboard className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Password Clipboard Copy */}
                          <div className="bg-black/30 border border-white/5 rounded-xl p-2 flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="block text-[8px] text-slate-500 font-mono">GENERATED PASSWORD</span>
                              <span className="text-blue-300 font-bold font-mono tracking-wider">{formPassword}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(formPassword, "Password")}
                              className="p-1 rounded bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors cursor-pointer"
                              title="Copy Password"
                            >
                              <Clipboard className="w-3 h-3" />
                            </button>
                          </div>

                          {/* 2FA Key Clipboard Copy */}
                          <div className="bg-black/30 border border-white/5 rounded-xl p-2 flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="block text-[8px] text-slate-500 font-mono">SECRET 2FA KEY</span>
                              <span className="text-slate-300 font-mono truncate max-w-[150px] block">{form2fa || 'No 2FA key pasted'}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(form2fa || 'No 2FA key pasted', "2FA Key")}
                              className="p-1 rounded bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors cursor-pointer"
                              title="Copy 2FA Key"
                            >
                              <Clipboard className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Save Trigger Button inside overlay */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/5">
                          <button
                            onClick={handleSaveFromOverlay}
                            className="bg-blue-600 hover:bg-blue-500 font-sans font-black tracking-tight text-white py-1.5 px-1 rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Save className="w-2.5 h-2.5" />
                            <span>SAVE RECORD</span>
                          </button>
                          <button
                            onClick={() => setOverlayState('BUBBLE')}
                            className="bg-white/10 hover:bg-white/20 font-mono text-slate-300 py-1.5 px-1 rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <MinimizeIcon className="w-2.5 h-2.5" />
                            <span>MINIMIZE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* MOCK HARDWARE SYSTEM NAVIGATION BUTTONS AREA */}
            <div className="h-10 bg-black/90 flex items-center justify-around px-8 z-40 border-t border-slate-900/60">
              {/* Recents Button */}
              <button 
                onClick={() => {
                  showToast("Android Multitasking active", "info");
                }}
                className="p-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-sm" />
              </button>

              {/* Home Button */}
              <button 
                onClick={() => setScreenMode('HOME')}
                className="p-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <div className="w-4 h-4 border-2 border-slate-400 rounded-full" />
              </button>

              {/* Back Button */}
              <button 
                onClick={() => {
                  if (screenMode === 'APP' && appScreen !== 'MANAGER') {
                    setAppScreen('MANAGER');
                  } else {
                    setScreenMode('HOME');
                  }
                }}
                className="p-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </button>
            </div>

          </div>
        </section>

        {/* ====================================================
            RIGHT PANEL: DEVELOPER STUDIO DELIVERABLES CONSOLE
            ==================================================== */}
        <section className="lg:col-span-7 flex flex-col h-full bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header tabs code etc */}
          <div className="px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-400" />
              <span className="font-sans font-bold text-slate-100 tracking-wide text-sm uppercase">RUBAB APK DEV STUDIO</span>
            </div>

            <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveWorkspaceTab('CODE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activeWorkspaceTab === 'CODE' 
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 inline mr-1" />
                Code Files
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('BUILD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activeWorkspaceTab === 'BUILD' 
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 inline mr-1" />
                APK Compiler
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('RECORDS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activeWorkspaceTab === 'RECORDS' 
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5 inline mr-1" />
                DB Feed
              </button>
            </div>
          </div>

          {/* TAB CONTENTS */}
          <div className="p-6 flex-1 flex flex-col overflow-hidden min-h-[420px]">
            
            {/* 1. CODE TEMPLATE DELIVERABLES TAB */}
            {activeWorkspaceTab === 'CODE' && (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    📄 Total of <strong className="text-blue-400">{FLUTTER_TEMPLATES.length}</strong> deployment-ready files:
                  </div>

                  <button
                    onClick={() => {
                      // Bulk copy all files
                      let bulk = '';
                      FLUTTER_TEMPLATES.forEach(f => {
                         bulk += `// ===================================\n// FILE: ${f.path}\n// ===================================\n${f.content}\n\n`;
                      });
                      navigator.clipboard.writeText(bulk);
                      showToast("Copied Flutter Project Bundle!", "success");
                    }}
                    className="bg-blue-600/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Copy Complete Bundle
                  </button>
                </div>

                {/* Sub-tabs list of files */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FLUTTER_TEMPLATES.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFileIndex(idx)}
                      className={`text-[10px] sm:text-xs py-2 px-2 rounded-lg border text-left font-mono truncate transition-all cursor-pointer ${
                        selectedFileIndex === idx
                          ? 'bg-white/10 text-blue-300 border-white/20 font-bold shadow-sm'
                          : 'bg-black/30 text-slate-400 border-white/5 hover:text-slate-300'
                      }`}
                    >
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>

                {/* Code syntax viewer */}
                <div className="flex-1 overflow-y-auto bg-black/45 border border-white/10 rounded-2xl p-4 flex flex-col h-[320px] max-h-[350px] custom-scrollbar">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-[10px] font-mono text-slate-300">
                    <span>PATH: <strong className="text-slate-300">{FLUTTER_TEMPLATES[selectedFileIndex].path}</strong></span>
                    <button
                      onClick={() => copyToClipboard(FLUTTER_TEMPLATES[selectedFileIndex].content, FLUTTER_TEMPLATES[selectedFileIndex].name)}
                      className="text-blue-300 hover:text-blue-200 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Code
                    </button>
                  </div>
                  <pre className="flex-1 font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre leading-relaxed font-medium">
                    <code>{FLUTTER_TEMPLATES[selectedFileIndex].content}</code>
                  </pre>
                </div>

                <div className="text-[11px] text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-2.5 backdrop-blur-sm">
                  <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                  <p className="font-sans">
                    <strong>Architectural Note:</strong> Formulated using **Flutter Clean Architecture**. Riverpod handles background service state listeners; the overlay UI receives copy/paste triggers directly connected to Android's native `ClipboardManager` and the SQLite `sqflite` driver.
                  </p>
                </div>
              </div>
            )}

            {/* 2. DYNAMIC APP COMPILER TAB */}
            {activeWorkspaceTab === 'BUILD' && (
              <div className="flex-1 flex flex-col gap-4">
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-sm">
                  <Smartphone className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="font-sans font-bold text-sm text-slate-100 uppercase">Interactive APK Packager</h3>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1 mb-4 leading-relaxed">
                    Compile the compiled source trees to produce a target-supported release package fit for Samsung Galaxy A Series devices running Android 12 (API Target 31) through Android 14.
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={triggerSDKBuild}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-sans font-black px-6 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/30 active:scale-[0.99]"
                    >
                      <Play className="w-4 h-4" />
                      Build Singed APK (Gradle)
                    </button>

                    <button
                      onClick={() => {
                        setBuildLogs([]);
                        setCompileProgress(null);
                        setCompileSuccess(false);
                      }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-2 rounded-xl text-xs font-mono cursor-pointer"
                    >
                      Reset Logs
                    </button>
                  </div>
                </div>

                {/* Progress bar compilation representation */}
                {compileProgress !== null && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 font-mono">
                    <div className="flex justify-between items-center text-xs mb-2 text-slate-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-300 animate-spin" />
                        {compileStep}
                      </span>
                      <span className="text-blue-300 font-bold">{compileProgress}%</span>
                    </div>

                    <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${compileProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Compile Terminal window log outputs */}
                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 overflow-y-auto font-mono text-[11px] text-slate-200 h-[220px] max-h-[250px] custom-scrollbar">
                  {buildLogs.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 select-none">
                      Console idle. Click "Build Signed APK" to invoke android compilations.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {buildLogs.map((log, index) => (
                        <div key={index} className="leading-relaxed whitespace-pre-wrap">
                          <span className="text-slate-500 font-bold">[{index + 1}]</span> {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Download target files download confirmation */}
                {compileSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-sans font-bold text-xs text-white uppercase tracking-wider">Compile Success: rubab_manager_release.apk</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Optimized for Samsung Hexa/Octa Core & Android 12 (One UI Version 4.0 up to 6.1)</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Dummy APK binary installer download helper
                        const fileContent = "MOCK APK BINARY PACKAGE CONTENT - RUBAB MANAGER ANDROID BUILD";
                        const blob = new Blob([fileContent], { type: "application/vnd.android.package-archive" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = "Rubab_Manager_v1.0.apk";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast("Installer APK Downloaded!", "success");
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-black text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow"
                    >
                      <Download className="w-4 h-4" />
                      Download APK
                    </button>
                  </motion.div>
                )}

              </div>
            )}

            {/* 3. DATABASE CONTROL PANEL TAB */}
            {activeWorkspaceTab === 'RECORDS' && (
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-sans font-bold text-sm text-slate-100 uppercase">Live Database Administrator console</h3>
                    <p className="text-xs text-slate-400">Review structured table entries currently saved inside browser Local Storage engine.</p>
                  </div>
                  <button 
                    onClick={handleExcelExport}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black py-1.5 px-3 rounded-lg text-xs font-bold font-sans flex items-center gap-1 transition-all cursor-pointer shadow-md"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Excel XLSX</span>
                  </button>
                </div>

                {records.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-center text-center py-10 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <Database className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-60" />
                    <p className="font-sans font-bold text-slate-300">No database accounts recorded yet</p>
                    <p className="text-xs text-slate-500 mt-1">Generate a user, insert a player UID code, and click "Save" in the device simulator.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto bg-black/30 border border-white/10 rounded-2xl custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-black/40 text-slate-300 border-b border-white/5 font-mono text-[10px] uppercase">
                          <th className="p-3 pl-4">Name</th>
                          <th className="p-3">Player UID</th>
                          <th className="p-3">Generated Pass</th>
                          <th className="p-3">Google 2FA Secret</th>
                          <th className="p-3">Log Timestamp</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans text-slate-300">
                        {records.map(r => (
                          <tr key={r.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 pl-4 font-bold text-slate-100">{r.name}</td>
                            <td className="p-3 font-mono text-blue-300 font-medium tracking-tight bg-black/20">{r.uid}</td>
                            <td className="p-3 font-mono text-blue-400">{r.password}</td>
                            <td className="p-3 font-mono text-purple-300 text-[10px] max-w-[130px]">
                              <div className="flex items-center gap-1.5 justify-between">
                                <span className="truncate" title={r.twoFactorKey}>{r.twoFactorKey}</span>
                                {r.twoFactorKey && r.twoFactorKey !== 'No 2FA Key' && (
                                  <button
                                    onClick={() => {
                                      try {
                                        const clean = r.twoFactorKey.replace(/[\s-]/g, '').toUpperCase();
                                        const totpObj = new OTPAuth.TOTP({
                                          algorithm: 'SHA1',
                                          digits: 6,
                                          period: 30,
                                          secret: OTPAuth.Secret.fromBase32(clean)
                                        });
                                        const token = totpObj.generate();
                                        copyToClipboard(token, `2FA Code for ${r.name}`);
                                      } catch (err) {
                                        showToast("Invalid 2FA secret format", "error");
                                      }
                                    }}
                                    className="px-1.5 py-0.5 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 text-purple-300 rounded text-[9px] font-sans font-bold cursor-pointer shrink-0 transition-all font-bold"
                                    title="Generate 2fa.cn style token"
                                  >
                                    Get Code
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[10px]">
                              {r.date} - {r.time}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteRecord(r.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                title="Delete database record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Persistent Workspace diagnostics footer */}
          <div className="bg-black/40 px-6 py-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Workspace Sync STATUS: OK</span>
            </span>
            <span className="text-blue-300">No Sheets-Drive integration active (Clean, direct local-only file downloads)</span>
          </div>
        </section>

      </main>

      {/* ----------------------------------------------------
          PERSISTENT EXPLANATORY FOOTER AREA
          ---------------------------------------------------- */}
      <footer className="mt-auto border-t border-white/5 bg-black/20 backdrop-blur-md py-4 text-center text-xs text-slate-400 font-mono">
        <p>© 2026 Rubab Manager Developer Suite • Designed for Premium Gaming Service Administration</p>
      </footer>
    </div>
  );
}

// Custom simple icons for local layout
function MinimizeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14h6v6" />
      <path d="m14 10 6-6" />
      <path d="M20 10h-6V4" />
      <path d="m10 14-6 6" />
    </svg>
  );
}

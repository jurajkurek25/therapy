'use client';

export type Plan = 'start' | 'stabilita' | 'rytmus' | 'custom';
export type Partner = 'Hedepy' | 'Ksebe' | 'Mojra';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  delta: number;
  balance: number;
  type: 'credit' | 'debit' | 'topup';
}

export interface Voucher {
  id: string;
  code: string;
  partner: Partner;
  amount: number;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  recommendation?: {
    name: string;
    specialization: string;
    platform: Partner;
    slots: number;
  };
}

export interface User {
  name: string;
  email: string;
  plan: Plan;
  customAmount: number;
  credits: number;
  memberSince: string;
  sosDebt: number;        // credits currently owed (positive number, e.g. 60)
  memberMonths: number;   // paid months completed
}

export const SOS_VESTING_MONTHS = 3;
export const SOS_LIMIT = 60; // max debt in credits (one session)

/** True when user has earned the SOS feature and has no outstanding debt */
export function isSosEligible(user: User): boolean {
  return user.memberMonths >= SOS_VESTING_MONTHS && user.sosDebt === 0;
}

/** Months until SOS unlocks (0 if already unlocked or in debt) */
export function sosMonthsLeft(user: User): number {
  if (user.sosDebt > 0) return 0;
  return Math.max(0, SOS_VESTING_MONTHS - user.memberMonths);
}

const DEFAULT_USER: User = {
  name: 'Jana Nováková',
  email: 'jana@example.sk',
  plan: 'stabilita',
  customAmount: 45,
  credits: 47,
  memberSince: '2026-01-01',
  sosDebt: 0,
  memberMonths: 5,
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-01-01', description: 'Aktivácia plánu Stabilita', delta: 30, balance: 30, type: 'credit' },
  { id: 't2', date: '2026-02-01', description: 'Február · plán Stabilita', delta: 30, balance: 60, type: 'credit' },
  { id: 't3', date: '2026-03-01', description: 'Marec · plán Stabilita', delta: 30, balance: 90, type: 'credit' },
  { id: 't4', date: '2026-03-15', description: 'Kód → Hedepy · sedenie', delta: -60, balance: 30, type: 'debit' },
  { id: 't5', date: '2026-04-01', description: 'Apríl · plán Stabilita', delta: 30, balance: 60, type: 'credit' },
  { id: 't6', date: '2026-04-20', description: 'Kód → Ksebe · sedenie', delta: -60, balance: 0, type: 'debit' },
  { id: 't7', date: '2026-04-20', description: 'Dokup kreditov', delta: 17, balance: 17, type: 'topup' },
  { id: 't8', date: '2026-05-01', description: 'Máj · plán Stabilita', delta: 30, balance: 47, type: 'credit' },
  { id: 't9', date: '2026-05-01', description: 'SOS Mínus odomknutý po 3 mesiacoch', delta: 0, balance: 47, type: 'credit' },
];

const DEFAULT_VOUCHERS: Voucher[] = [
  { id: 'v1', code: 'TP—7K2M—9X4F', partner: 'Hedepy', amount: 60, createdAt: '2026-03-15', expiresAt: '2027-03-15', used: true },
  { id: 'v2', code: 'TP—3P8N—2Q7R', partner: 'Ksebe', amount: 60, createdAt: '2026-04-20', expiresAt: '2027-04-20', used: true },
];

const DEFAULT_CHAT: ChatMessage[] = [
  {
    id: 'c1',
    role: 'ai',
    content: 'Dobrý deň! Som váš AI poradca v Teraplan. Povedzte mi vlastnými slovami, čo riešite — bez formulárov, bez škál od 0 do 10. Čokoľvek, čo vám leží na srdci.',
    timestamp: '2026-05-01T10:00:00',
  },
];

function isClient() {
  return typeof window !== 'undefined';
}

function load<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUser(): User {
  return load('tp_user', DEFAULT_USER);
}
export function saveUser(u: User) {
  save('tp_user', u);
}

export function getTransactions(): Transaction[] {
  return load('tp_transactions', DEFAULT_TRANSACTIONS);
}
export function saveTransactions(t: Transaction[]) {
  save('tp_transactions', t);
}

export function getVouchers(): Voucher[] {
  return load('tp_vouchers', DEFAULT_VOUCHERS);
}
export function saveVouchers(v: Voucher[]) {
  save('tp_vouchers', v);
}

export function getChat(): ChatMessage[] {
  return load('tp_chat', DEFAULT_CHAT);
}
export function saveChat(c: ChatMessage[]) {
  save('tp_chat', c);
}

export function isLoggedIn(): boolean {
  if (!isClient()) return false;
  return localStorage.getItem('tp_logged_in') === '1';
}
export function setLoggedIn(v: boolean) {
  if (!isClient()) return;
  if (v) localStorage.setItem('tp_logged_in', '1');
  else localStorage.removeItem('tp_logged_in');
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `TP—${seg(4)}—${seg(4)}`;
}

export function addMonths(date: string, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export const PLAN_LABELS: Record<Plan, string> = {
  start: 'Štart',
  stabilita: 'Stabilita',
  rytmus: 'Rytmus',
  custom: 'Vlastná suma',
};

export const PLAN_CREDITS: Record<Plan, number> = {
  start: 9,
  stabilita: 30,
  rytmus: 60,
  custom: 45,
};

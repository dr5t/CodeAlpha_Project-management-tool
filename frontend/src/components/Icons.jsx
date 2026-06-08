import React from 'react';

export const Icons = {
  Dashboard: ({ s = 18 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Profile: ({ s = 18 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/>
      <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  Settings: ({ s = 18 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/>
      <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Bell: ({ s = 18 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path strokeLinecap="round" d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Plus: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M12 5v14m-7-7h14"/>
    </svg>
  ),
  Close: ({ s = 18 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  ),
  Edit: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
    </svg>
  ),
  Trash: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16M10 3h4"/>
    </svg>
  ),
  Logout: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  ),
  ChevronLeft: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
    </svg>
  ),
  ChevronRight: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  ),
  Send: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
  Comment: ({ s = 15 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Calendar: ({ s = 12 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  AddUser: ({ s = 15 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path strokeLinecap="round" d="M22 11h-6m3-3v6"/>
    </svg>
  ),
  Upload: ({ s = 20 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline strokeLinecap="round" strokeLinejoin="round" points="17 8 12 3 7 8"/>
      <line strokeLinecap="round" x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Camera: ({ s = 20 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Eye: ({ s = 15 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Move: ({ s = 14 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M5 9l7-7 7 7M5 15l7 7 7-7"/>
    </svg>
  ),
  Alert: ({ s = 14 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
    </svg>
  ),
  Check: ({ s = 15 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12"/>
    </svg>
  ),
  Star: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Lock: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Key: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  Warning: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  ),
  Projects: ({ s = 18 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
    </svg>
  ),
  Activity: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline strokeLinecap="round" strokeLinejoin="round" points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Invite: ({ s = 16 }) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/>
      <polyline strokeLinecap="round" strokeLinejoin="round" points="22 6 12 13 2 6"/>
    </svg>
  ),
};

export const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b',
  '#10b981','#06b6d4','#3b82f6','#84cc16','#14b8a6','#f97316','#06d6a0'
];

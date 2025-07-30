import React from 'react';

export const AppColors = {
  primary: '#2E7D32', // Scout Green
  accent: '#FFB300', // Yellow Button
  background: '#F5F5F5',
  text: '#1F2937',
  card: '#FFFFFF',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

export const AppRoutes = {
  home: '/',
  login: '/login',
  publicLeaderboard: '/leaderboard',
  adminDashboard: '/admin/dashboard',
  adminManageCompetitions: '/admin/competitions',
  adminRegisterTeam: '/admin/register',
  adminRecap: '/admin/recap',
  adminTeamList: '/admin/teams',
  judgePortal: '/judge/portal',
};

export const ScoutBadgeIcon = (props: React.ComponentProps<'svg'>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L4.5 5V12C4.5 16.97 7.81 21.5 12 22.5C16.19 21.5 19.5 16.97 19.5 12V5L12 2ZM12 11.1L14.59 12.85L13.88 9.92L16.15 7.99L13.24 7.7L12 5L10.76 7.7L7.85 7.99L10.12 9.92L9.41 12.85L12 11.1Z" />
  </svg>
);

export const MenuIcon = (props: React.ComponentProps<'svg'>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const CloseIcon = (props: React.ComponentProps<'svg'>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const TrophyIcon = (props: React.ComponentProps<'svg'>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125v3.375m9 0h-9m9 0a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25m13.5 0v-11.25c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125v11.25" />
    </svg>
);

export const UsersIcon = (props: React.ComponentProps<'svg'>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.625.933.938 2.043.938 3.172zM15 9.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12.75 9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

export const ClipboardListIcon = (props: React.ComponentProps<'svg'>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const ChartBarIcon = (props: React.ComponentProps<'svg'>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

export const PlusCircleIcon = (props: React.ComponentProps<'svg'>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const LogoutIcon = (props: React.ComponentProps<'svg'>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);

export const PrinterIcon = (props: React.ComponentProps<'svg'>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.25m0 0a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25m-7.5 0h7.5m-7.5 0l-.227-.184a49.941 49.941 0 00-4.082-3.66M18 18.25l-.227-.184a49.941 49.941 0 00-4.082-3.66m4.309 3.844A42.415 42.415 0 0018 14.077m0 0a42.415 42.415 0 00-10.56 0m10.56 0L18 18.25m0 0a2.25 2.25 0 012.25 2.25h1.5a2.25 2.25 0 012.25-2.25m-7.5 0h7.5m-7.5 0l.227.184a49.941 49.941 0 014.082 3.66M6 18.25l.227.184a49.941 49.941 0 014.082 3.66m0 0a2.25 2.25 0 002.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25m-1.5-3.375V6.75A2.25 2.25 0 019.75 4.5h4.5a2.25 2.25 0 012.25 2.25v5.25m-6.75 0h6.75" />
    </svg>
);
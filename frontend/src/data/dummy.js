// ============================================================
// DATA DUMMY — Ganti dengan API call ke Laravel saat BE siap
// ============================================================

export const dummyUser = {
  id: 1,
  name: 'Sergius',
  email: 'admin@kelolateam.com',
  role: 'admin',
  avatar: 'SG',
  avatarColor: 'bg-emerald-100 text-emerald-800',
}

export const dummyTeams = [
  {
    id: 1, name: 'Tim Alpha', category: 'Pengembangan Produk',
    status: 'aktif', capacity: 78, memberCount: 7, taskCount: 6,
    color: 'bg-black', warn: 'red',
    members: [
      { id: 1, name: 'Sergius', avatar: 'SG', color: 'bg-emerald-100 text-emerald-800', role: 'leader', status_online: 'online', taskCount: 4 },
      { id: 2, name: 'Pradiza', avatar: 'PR', color: 'bg-orange-100 text-orange-800', role: 'member', status_online: 'away', taskCount: 2 },
      { id: 3, name: 'Rafi', avatar: 'RF', color: 'bg-purple-100 text-purple-800', role: 'member', status_online: 'offline', taskCount: 0 },
    ]
  },
  {
    id: 2, name: 'Tim Beta', category: 'Riset & Analisis',
    status: 'aktif', capacity: 65, memberCount: 5, taskCount: 3,
    color: 'bg-gray-700', warn: 'amber',
    members: [
      { id: 4, name: 'Akbar', avatar: 'AK', color: 'bg-blue-100 text-blue-800', role: 'leader', status_online: 'online', taskCount: 3 },
      { id: 5, name: 'Dinda', avatar: 'DN', color: 'bg-pink-100 text-pink-800', role: 'member', status_online: 'online', taskCount: 1 },
    ]
  },
  {
    id: 3, name: 'Tim Gamma', category: 'Desain & Kreatif',
    status: 'baru', capacity: 32, memberCount: 3, taskCount: 2,
    color: 'bg-gray-300', warn: 'none',
    members: [
      { id: 6, name: 'Nurul', avatar: 'NR', color: 'bg-rose-100 text-rose-800', role: 'leader', status_online: 'offline', taskCount: 1 },
    ]
  },
]

export const dummyTasks = [
  { id: 1, title: 'Proposal Desain UI', team: 'Tim Alpha', assignee: 'Sergius', avatar: 'SG', avatarColor: 'bg-emerald-100 text-emerald-800', priority: 'urgent', status: 'review', due_date: '2026-04-20', progress: 100 },
  { id: 2, title: 'Laporan Bulanan', team: 'Tim Beta', assignee: 'Akbar', avatar: 'AK', avatarColor: 'bg-blue-100 text-blue-800', priority: 'normal', status: 'review', due_date: '2026-04-25', progress: 90 },
  { id: 3, title: 'Database Setup', team: 'Tim Alpha', assignee: 'Pradiza', avatar: 'PR', avatarColor: 'bg-orange-100 text-orange-800', priority: 'urgent', status: 'doing', due_date: '2026-04-18', progress: 60 },
  { id: 4, title: 'Riset Kompetitor', team: 'Tim Gamma', assignee: 'Akbar', avatar: 'AK', avatarColor: 'bg-blue-100 text-blue-800', priority: 'normal', status: 'todo', due_date: '2026-04-30', progress: 0 },
  { id: 5, title: 'Desain Landing Page', team: 'Tim Gamma', assignee: 'Nurul', avatar: 'NR', avatarColor: 'bg-rose-100 text-rose-800', priority: 'normal', status: 'doing', due_date: '2026-05-01', progress: 40 },
  { id: 6, title: 'Integrasi API Payment', team: 'Tim Alpha', assignee: 'Rafi', avatar: 'RF', avatarColor: 'bg-purple-100 text-purple-800', priority: 'urgent', status: 'todo', due_date: '2026-04-22', progress: 0 },
  { id: 7, title: 'Laporan Keuangan Q1', team: 'Tim Beta', assignee: 'Dinda', avatar: 'DN', avatarColor: 'bg-pink-100 text-pink-800', priority: 'normal', status: 'approved', due_date: '2026-04-10', progress: 100 },
]

export const dummyAttendances = [
  { id: 1, name: 'Sergius', avatar: 'SG', color: 'bg-emerald-100 text-emerald-800', team: 'Tim Alpha', clock_in: '08:02', status: 'hadir', date: '2026-05-17' },
  { id: 2, name: 'Akbar', avatar: 'AK', color: 'bg-blue-100 text-blue-800', team: 'Tim Beta', clock_in: '08:15', status: 'hadir', date: '2026-05-17' },
  { id: 3, name: 'Pradiza', avatar: 'PR', color: 'bg-orange-100 text-orange-800', team: 'Tim Alpha', clock_in: '09:10', status: 'lambat', date: '2026-05-17' },
  { id: 4, name: 'Nurul', avatar: 'NR', color: 'bg-rose-100 text-rose-800', team: 'Tim Gamma', clock_in: '-', status: 'izin', date: '2026-05-17' },
  { id: 5, name: 'Rafi', avatar: 'RF', color: 'bg-purple-100 text-purple-800', team: 'Tim Alpha', clock_in: '-', status: 'alpha', date: '2026-05-17' },
  { id: 6, name: 'Dinda', avatar: 'DN', color: 'bg-pink-100 text-pink-800', team: 'Tim Beta', clock_in: '07:58', status: 'hadir', date: '2026-05-17' },
]

export const dummyNotifications = [
  { id: 1, type: 'task_new', message: 'Tugas baru: Proposal Desain Q2 ditetapkan ke kamu', time: '10 menit lalu', read: false },
  { id: 2, type: 'attendance_alert', message: 'Pradiza terlambat masuk hari ini', time: '1 jam lalu', read: false },
  { id: 3, type: 'task_approved', message: 'Laporan Keuangan Q1 telah diapprove', time: '2 jam lalu', read: true },
]

export const dummyAiInsights = [
  { id: 1, type: 'recommendation', content: 'Sergius memiliki beban 40% lebih tinggi dari rata-rata. Pertimbangkan redistribusi ke Akbar yang kapasitasnya masih 60%.' },
  { id: 2, type: 'summary', content: 'Tim Gamma kehadiran 78% — di bawah target 85%. Evaluasi kebijakan absensi disarankan.' },
  { id: 3, type: 'performance_score', content: 'Pradiza memiliki 3 tugas telat berturut-turut. Sarankan sesi 1-on-1 dengan leader.' },
]

export const dummyPerformance = [
  { name: 'Sergius', avatar: 'SG', color: 'bg-emerald-100 text-emerald-800', score: 94, tasks: '9/9', hadir: '18/20', barColor: 'bg-emerald-500', note: 'Top performer bulan ini' },
  { name: 'Akbar', avatar: 'AK', color: 'bg-blue-100 text-blue-800', score: 78, tasks: '7/9', hadir: '19/20', barColor: 'bg-emerald-500', note: '' },
  { name: 'Pradiza', avatar: 'PR', color: 'bg-orange-100 text-orange-800', score: 52, tasks: '4/9', hadir: '15/20', barColor: 'bg-red-400', note: 'Perlu perhatian' },
]
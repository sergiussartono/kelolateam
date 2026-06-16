import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import useAuthStore from '../store/authStore'
import taskService from '../services/taskService'
import attendanceService from '../services/attendanceService'
import { CheckCircle, Clock, Users, TrendingUp } from 'lucide-react'
import { toast } from 'react-hot-toast'

const statusBadge = {
  review:   'bg-amber-100 text-amber-700',
  doing:    'bg-blue-100 text-blue-700',
  todo:     'bg-gray-100 text-gray-600',
  approved: 'bg-emerald-100 text-emerald-700',
}
const statusLabel = { review: 'Review', doing: 'Proses', todo: 'Belum', approved: 'Selesai' }

const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

// Warna header card tim — cycling
const CARD_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500']

export default function DashboardPage() {
  const { user, fetchMe } = useAuthStore()
  const [tasks, setTasks]           = useState([])
  const [attendances, setAttendances] = useState([])
  const [teams, setTeams]           = useState([])
  const [loading, setLoading]       = useState(true)

  const d = new Date()
  const today = `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
  const todayISO = d.toISOString().split('T')[0]

  useEffect(() => {
    if (!user) fetchMe()
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [taskRes, attendRes] = await Promise.all([
        taskService.getAll(),
        attendanceService.getAll({ date: todayISO }),
      ])
      setTasks(taskRes.data?.data ?? taskRes.data ?? [])
      setAttendances(attendRes.data?.data ?? attendRes.data ?? [])
    } catch {
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await taskService.updateStatus(id, 'approved')
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t))
      toast.success('Tugas diapprove!')
    } catch { toast.error('Gagal approve tugas') }
  }

  const handleRevisi = async (id) => {
    try {
      await taskService.updateStatus(id, 'doing')
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'doing' } : t))
      toast.success('Tugas dikembalikan untuk revisi')
    } catch { toast.error('Gagal meminta revisi') }
  }

  const pendingReview = tasks.filter(t => t.status === 'review')
  const activeTasks   = tasks.filter(t => ['todo','doing','review'].includes(t.status))
  const doneTasks     = tasks.filter(t => t.status === 'approved')
  const hadir         = attendances.filter(a => a.status === 'hadir').length
  const total         = attendances.length || 1
  const pctHadir      = Math.round((hadir / total) * 100)

  const metrics = [
    { label: 'Total Anggota',  value: attendances.length || 0, sub: '3 tim aktif',               icon: Users,       iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',    subColor: 'text-blue-500' },
    { label: 'Tugas Aktif',    value: activeTasks.length,      sub: `${pendingReview.length} pending review`, icon: Clock, iconBg: 'bg-amber-50',   iconColor: 'text-amber-500',   subColor: 'text-amber-500' },
    { label: 'Hadir Hari Ini', value: hadir,                   sub: `${pctHadir}% kehadiran`,     icon: TrendingUp,  iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', subColor: 'text-emerald-500' },
    { label: 'Tugas Selesai',  value: doneTasks.length,        sub: 'bulan ini',                  icon: CheckCircle, iconBg: 'bg-purple-50',  iconColor: 'text-purple-500',  subColor: 'text-purple-500' },
  ]

  // Kumpulkan tim unik dari task
  const teamMap = {}
  tasks.forEach(t => {
    if (t.team && !teamMap[t.team.id]) teamMap[t.team.id] = { ...t.team, tasks: [] }
    if (t.team) teamMap[t.team.id].tasks.push(t)
  })
  const teamList = Object.values(teamMap)

  const absenRows = [
    { label: 'Hadir', val: attendances.filter(a => a.status === 'hadir').length, color: 'bg-emerald-500' },
    { label: 'Izin',  val: attendances.filter(a => a.status === 'izin').length,  color: 'bg-amber-400' },
    { label: 'Alpha', val: attendances.filter(a => a.status === 'alpha').length, color: 'bg-red-400' },
  ]

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat data...</div>
    </Layout>
  )

  return (
    <Layout>
      {/* ── Greeting ── */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold">Selamat datang, {user?.name ?? '—'} 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>

      {/* ── Metric chips — horizontal scroll on mobile ── */}
      <div className="flex gap-3 overflow-x-auto pb-1 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4">
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div key={m.label}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex-shrink-0 w-40 sm:w-auto">
              <div className={`w-9 h-9 rounded-xl ${m.iconBg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={m.iconColor} />
              </div>
              <p className="text-2xl font-semibold text-gray-900 leading-none">{m.value}</p>
              <p className="text-xs text-gray-400 mt-1">{m.label}</p>
              <p className={`text-xs mt-1 font-medium ${m.subColor}`}>{m.sub}</p>
            </div>
          )
        })}
      </div>

      {/* ── Tim cards — horizontal scroll ── */}
      {teamList.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Tim kamu</p>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {teamList.map((team, i) => {
              const aktivTugas = team.tasks?.filter(t => ['todo','doing','review'].includes(t.status)).length ?? 0
              const headerBg = CARD_COLORS[i % CARD_COLORS.length]
              const initials = team.name?.slice(0, 2).toUpperCase() ?? 'TM'
              return (
                <div key={team.id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex-shrink-0 w-44 sm:w-52">
                  {/* Card header berwarna */}
                  <div className={`${headerBg} p-4 relative`}>
                    <p className="text-sm font-semibold text-white leading-tight">{team.name}</p>
                    <p className="text-xs text-white/75 mt-0.5">{team.category ?? 'Tim'}</p>
                    {/* Avatar pojok kanan bawah */}
                    <div className="absolute -bottom-4 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-gray-700 border-2 border-white shadow-sm">
                      {initials}
                    </div>
                  </div>
                  {/* Card body */}
                  <div className="pt-6 pb-3 px-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Tugas aktif</span>
                      <span className="font-medium text-gray-700">{aktivTugas}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Anggota</span>
                      <span className="font-medium text-gray-700">{team.members?.length ?? '—'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Baris bawah: feed + (approval & absensi) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Aktivitas Terbaru */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Aktivitas terbaru</p>
          {tasks.length === 0
            ? <p className="text-xs text-gray-300 text-center py-8">Belum ada tugas</p>
            : tasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                  {t.user?.name?.slice(0, 2).toUpperCase() ?? 'NA'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-gray-400 truncate">{t.user?.name} · {t.team?.name}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadge[t.status]}`}>
                  {statusLabel[t.status]}
                </span>
              </div>
            ))
          }
        </div>

        {/* Kolom kanan */}
        <div className="flex flex-col gap-4">

          {/* Pending Approval */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Pending approval</p>
            {pendingReview.length === 0
              ? <p className="text-xs text-gray-300 text-center py-4">Tidak ada tugas pending</p>
              : pendingReview.map(t => (
                <div key={t.id} className="bg-gray-50 rounded-xl p-3 mb-2 last:mb-0">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.user?.name} · {t.team?.name}</p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">Review</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(t.id)}
                      className="flex-1 bg-black text-white text-xs py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                      Approve
                    </button>
                    <button onClick={() => handleRevisi(t.id)}
                      className="flex-1 border border-gray-200 text-xs py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      Revisi
                    </button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Status Absensi */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Absensi hari ini</p>
            {absenRows.map(s => (
              <div key={s.label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-gray-500">{s.label}</span>
                  </div>
                  <span className="font-medium text-gray-700">{s.val}/{total}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${Math.round((s.val / total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  )
}
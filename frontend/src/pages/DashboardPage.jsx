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

export default function DashboardPage() {
  const { user, fetchMe } = useAuthStore()
  const [tasks, setTasks] = useState([])
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const todayISO = new Date().toISOString().split('T')[0]

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
  const activeTasks   = tasks.filter(t => ['todo', 'doing', 'review'].includes(t.status))
  const doneTasks     = tasks.filter(t => t.status === 'approved')

  const hadir = attendances.filter(a => a.status === 'hadir').length
  const total  = attendances.length || 1
  const pctHadir = Math.round((hadir / total) * 100)

  const metrics = [
    { label: 'Total Anggota', value: attendances.length || 0, sub: '3 tim aktif', icon: Users, color: 'text-blue-500' },
    { label: 'Tugas Aktif', value: activeTasks.length, sub: `${pendingReview.length} pending review`, icon: Clock, color: 'text-amber-500' },
    { label: 'Hadir Hari Ini', value: hadir, sub: `${pctHadir}% kehadiran`, icon: TrendingUp, color: 'text-emerald-500', green: true },
    { label: 'Tugas Selesai', value: doneTasks.length, sub: 'bulan ini', icon: CheckCircle, color: 'text-emerald-500', green: true },
  ]

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat data...</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Selamat datang, {user?.name ?? '—'} 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{today}</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-200 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">Filter</button>
          <button className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">+ Buat Tim</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">{m.label}</p>
                <Icon size={16} className={m.color} />
              </div>
              <p className="text-2xl font-semibold">{m.value}</p>
              <p className={`text-xs mt-1 ${m.green ? 'text-emerald-600' : 'text-gray-400'}`}>{m.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Baris Bawah */}
      <div className="grid grid-cols-2 gap-4">
        {/* Aktivitas Terbaru */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Aktivitas Terbaru</p>
          {tasks.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                {t.user?.name?.slice(0, 2).toUpperCase() ?? 'NA'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <p className="text-xs text-gray-400">{t.user?.name} · {t.team?.name}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge[t.status]}`}>
                {statusLabel[t.status]}
              </span>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-xs text-gray-300 text-center py-6">Belum ada tugas</p>}
        </div>

        <div className="flex flex-col gap-4">
          {/* Pending Approval */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Pending Approval</p>
            {pendingReview.length === 0
              ? <p className="text-xs text-gray-300 text-center py-4">Tidak ada tugas pending</p>
              : pendingReview.map(t => (
                <div key={t.id} className="bg-gray-50 rounded-xl p-3 mb-2 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">{t.title}</p>
                    <span className="text-xs text-gray-400">{t.user?.name} · {t.team?.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(t.id)}
                      className="flex-1 bg-black text-white text-xs py-1.5 rounded-lg hover:bg-gray-800 transition-colors">Approve</button>
                    <button onClick={() => handleRevisi(t.id)}
                      className="flex-1 border border-gray-200 text-xs py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Revisi</button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Status Absensi */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Status Absensi Hari Ini</p>
            {[
              { label: 'Hadir', val: attendances.filter(a => a.status === 'hadir').length, warna: 'bg-emerald-500' },
              { label: 'Izin',  val: attendances.filter(a => a.status === 'izin').length,  warna: 'bg-amber-400' },
              { label: 'Alpha', val: attendances.filter(a => a.status === 'alpha').length, warna: 'bg-red-400' },
            ].map(s => (
              <div key={s.label} className="mb-2.5 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{s.label}</span>
                  <span className="font-medium">{s.val}/{total}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.warna}`} style={{ width: `${Math.round((s.val/total)*100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
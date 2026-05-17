import Layout from '../components/Layout'
import { dummyTasks, dummyAttendances } from '../data/dummy'
import { CheckCircle, Clock, Users, TrendingUp } from 'lucide-react'

const metrics = [
  { label: 'Total Anggota', value: 48, sub: '3 tim aktif', icon: Users, color: 'text-blue-500' },
  { label: 'Tugas Aktif', value: 12, sub: '3 pending review', icon: Clock, color: 'text-amber-500' },
  { label: 'Hadir Hari Ini', value: 41, sub: '85% kehadiran', icon: TrendingUp, color: 'text-emerald-500', green: true },
  { label: 'Tugas Selesai', value: 7, sub: 'bulan ini', icon: CheckCircle, color: 'text-emerald-500', green: true },
]

const aktivitas = dummyTasks.slice(0, 4)

const pendingApproval = dummyTasks.filter(t => t.status === 'review')

const statusBadge = {
  review: 'bg-amber-100 text-amber-700',
  doing: 'bg-blue-100 text-blue-700',
  todo: 'bg-gray-100 text-gray-600',
  approved: 'bg-emerald-100 text-emerald-700',
}
const statusLabel = { review: 'Review', doing: 'Proses', todo: 'Belum', approved: 'Selesai' }

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Selamat datang, Sergius 👋</h1>
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
          {aktivitas.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${a.avatarColor}`}>
                {a.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-gray-400">{a.assignee} · {a.team}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge[a.status]}`}>
                {statusLabel[a.status]}
              </span>
            </div>
          ))}
        </div>

        {/* Kolom kanan */}
        <div className="flex flex-col gap-4">
          {/* Pending Approval */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Pending Approval</p>
            <div className="flex flex-col gap-2">
              {pendingApproval.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <span className="text-xs text-gray-400">{item.assignee} · {item.team}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-black text-white text-xs py-1.5 rounded-lg hover:bg-gray-800 transition-colors">Approve</button>
                    <button className="flex-1 border border-gray-200 text-xs py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Revisi</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Absensi */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Status Absensi Hari Ini</p>
            {[
              { label: 'Hadir', val: '41/48', persen: 85, warna: 'bg-emerald-500' },
              { label: 'Izin', val: '5/48', persen: 10, warna: 'bg-amber-400' },
              { label: 'Alpha', val: '2/48', persen: 4, warna: 'bg-red-400' },
            ].map(s => (
              <div key={s.label} className="mb-2.5 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{s.label}</span>
                  <span className="font-medium">{s.val}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.warna} transition-all`} style={{ width: `${s.persen}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
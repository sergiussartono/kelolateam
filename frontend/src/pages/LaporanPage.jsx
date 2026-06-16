import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import taskService from '../services/taskService'
import attendanceService from '../services/attendanceService'
import teamService from '../services/teamService'
import { Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

export default function LaporanPage() {
  const [tasks, setTasks]           = useState([])
  const [attendances, setAttendances] = useState([])
  const [teams, setTeams]           = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [taskRes, attendRes, teamRes] = await Promise.all([
        taskService.getAll(),
        attendanceService.getAll(),
        teamService.getAll(),
      ])
      setTasks(taskRes.data ?? [])
      setAttendances(attendRes.data ?? [])
      setTeams(teamRes.data ?? [])
    } catch {
      toast.error('Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }

  // Hitung statistik dari data real
  const totalTugas    = tasks.length
  const tugasSelesai  = tasks.filter(t => t.status === 'approved').length
  const tugasAktif    = tasks.filter(t => ['todo','doing','review'].includes(t.status)).length
  const totalHadir    = attendances.filter(a => a.status === 'hadir').length
  const pctHadir      = attendances.length ? Math.round((totalHadir / attendances.length) * 100) : 0

  // Grafik kehadiran per bulan (grouping dari data real)
  const kehadiranPerBulan = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const bulan = d.toLocaleDateString('id-ID', { month: 'short' })
    const tahun = d.getFullYear()
    const bln   = String(d.getMonth() + 1).padStart(2, '0')
    const prefix = `${tahun}-${bln}`

    const bln_data  = attendances.filter(a => a.date?.startsWith(prefix))
    const hadir_bln = bln_data.filter(a => a.status === 'hadir').length
    const pct       = bln_data.length ? Math.round((hadir_bln / bln_data.length) * 100) : 0
    return { bulan, persen: pct }
  })

  // Grafik tugas per bulan
  const tugasPerBulan = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const bulan = d.toLocaleDateString('id-ID', { month: 'short' })
    const tahun = d.getFullYear()
    const bln   = String(d.getMonth() + 1).padStart(2, '0')
    const prefix = `${tahun}-${bln}`

    const selesai  = tasks.filter(t => t.status === 'approved' && t.updated_at?.startsWith(prefix)).length
    const terlambat = tasks.filter(t => t.due_date?.startsWith(prefix) && t.status !== 'approved').length
    return { bulan, selesai, terlambat }
  })

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat data laporan...</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Laporan & Analisis</h1>
          <p className="text-sm text-gray-400 mt-0.5">Data real-time dari sistem</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-gray-200 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export PDF
          </button>
          <button className="flex items-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Rata-rata Kehadiran', value: `${pctHadir}%`,   sub: `${totalHadir} dari ${attendances.length} hari`, color: 'text-emerald-600' },
          { label: 'Tugas Selesai',       value: tugasSelesai,      sub: `dari ${totalTugas} total tugas`,               color: 'text-black' },
          { label: 'Tugas Aktif',         value: tugasAktif,        sub: 'sedang berjalan',                              color: 'text-amber-600' },
          { label: 'Total Tim',           value: teams.length,      sub: `${teams.reduce((a,t) => a + (t.members?.length ?? 0), 0)} anggota`, color: 'text-black' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Grafik Kehadiran */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Tren Kehadiran (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={kehadiranPerBulan}>
              <XAxis dataKey="bulan" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f1f1', fontSize: '12px' }}
                formatter={v => [`${v}%`, 'Kehadiran']}
              />
              <Line type="monotone" dataKey="persen" stroke="#111" strokeWidth={2} dot={{ fill: '#111', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grafik Tugas */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Tugas Selesai vs Terlambat</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tugasPerBulan} barGap={4}>
              <XAxis dataKey="bulan" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f1f1', fontSize: '12px' }} />
              <Bar dataKey="selesai"   name="Selesai"   fill="#111"     radius={[4,4,0,0]} />
              <Bar dataKey="terlambat" name="Terlambat" fill="#FCA5A5"  radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel per Tim */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Performa Per Tim</p>
        {teams.length === 0 ? (
          <p className="text-xs text-gray-300 text-center py-6">Belum ada data tim</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left pb-2">Tim</th>
                <th className="text-left pb-2">Anggota</th>
                <th className="text-left pb-2">Tugas Aktif</th>
                <th className="text-left pb-2">Tugas Selesai</th>
                <th className="text-left pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => {
                const aktif   = team.tasks?.filter(t => ['todo','doing','review'].includes(t.status)).length ?? 0
                const selesai = team.tasks?.filter(t => t.status === 'approved').length ?? 0
                return (
                  <tr key={team.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <p className="font-medium">{team.name}</p>
                      <p className="text-xs text-gray-400">{team.category}</p>
                    </td>
                    <td className="py-3 text-gray-600">{team.members?.length ?? 0} orang</td>
                    <td className="py-3 text-gray-600">{aktif} tugas</td>
                    <td className="py-3 text-gray-600">{selesai} tugas</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                        ${team.status === 'aktif' ? 'bg-emerald-100 text-emerald-700'
                          : team.status === 'baru' ? 'bg-gray-100 text-gray-600'
                          : 'bg-red-100 text-red-600'}`}>
                        {team.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
import Layout from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Download } from 'lucide-react'

const dataKehadiran = [
  { bulan: 'Jan', persen: 88 }, { bulan: 'Feb', persen: 92 },
  { bulan: 'Mar', persen: 85 }, { bulan: 'Apr', persen: 90 },
  { bulan: 'Mei', persen: 87 }, { bulan: 'Jun', persen: 93 },
]

const dataTugas = [
  { bulan: 'Jan', selesai: 12, terlambat: 3 }, { bulan: 'Feb', selesai: 18, terlambat: 2 },
  { bulan: 'Mar', selesai: 15, terlambat: 4 }, { bulan: 'Apr', selesai: 22, terlambat: 1 },
  { bulan: 'Mei', selesai: 19, terlambat: 3 }, { bulan: 'Jun', selesai: 25, terlambat: 2 },
]

export default function LaporanPage() {
  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Laporan & Analisis</h1>
          <p className="text-sm text-gray-400 mt-0.5">Periode: Januari — Juni 2026</p>
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
          { label: 'Total Kehadiran', value: '89%', sub: 'Rata-rata 6 bulan', color: 'text-emerald-600' },
          { label: 'Tugas Selesai', value: '111', sub: 'Total 6 bulan', color: 'text-black' },
          { label: 'Tingkat Keterlambatan', value: '15', sub: 'Total tugas terlambat', color: 'text-amber-600' },
          { label: 'Anggota Aktif', value: '48', sub: '3 tim', color: 'text-black' },
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
            <LineChart data={dataKehadiran}>
              <XAxis dataKey="bulan" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f1f1', fontSize: '12px' }}
                formatter={(v) => [`${v}%`, 'Kehadiran']}
              />
              <Line type="monotone" dataKey="persen" stroke="#111" strokeWidth={2} dot={{ fill: '#111', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grafik Tugas */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Tugas Selesai vs Terlambat</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataTugas} barGap={4}>
              <XAxis dataKey="bulan" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f1f1', fontSize: '12px' }}
              />
              <Bar dataKey="selesai" name="Selesai" fill="#111" radius={[4, 4, 0, 0]} />
              <Bar dataKey="terlambat" name="Terlambat" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel per Tim */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Performa Per Tim</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left pb-2">Tim</th>
              <th className="text-left pb-2">Anggota</th>
              <th className="text-left pb-2">Kehadiran</th>
              <th className="text-left pb-2">Tugas Selesai</th>
              <th className="text-left pb-2">Skor Rata-rata</th>
            </tr>
          </thead>
          <tbody>
            {[
              { tim: 'Tim Alpha', kategori: 'Pengembangan Produk', anggota: 7, kehadiran: 88, selesai: 45, skor: 82 },
              { tim: 'Tim Beta', kategori: 'Riset & Analisis', anggota: 5, kehadiran: 92, selesai: 38, skor: 89 },
              { tim: 'Tim Gamma', kategori: 'Desain & Kreatif', anggota: 3, kehadiran: 78, selesai: 28, skor: 71 },
            ].map(row => (
              <tr key={row.tim} className="border-b border-gray-50 last:border-0">
                <td className="py-3">
                  <p className="font-medium">{row.tim}</p>
                  <p className="text-xs text-gray-400">{row.kategori}</p>
                </td>
                <td className="py-3 text-gray-600">{row.anggota} orang</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.kehadiran >= 85 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${row.kehadiran}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${row.kehadiran >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{row.kehadiran}%</span>
                  </div>
                </td>
                <td className="py-3 text-gray-600">{row.selesai} tugas</td>
                <td className="py-3">
                  <span className={`text-sm font-semibold ${row.skor >= 85 ? 'text-emerald-600' : row.skor >= 70 ? 'text-amber-600' : 'text-red-500'}`}>{row.skor}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
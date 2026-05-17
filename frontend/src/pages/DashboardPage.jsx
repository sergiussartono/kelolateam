import Sidebar from '../components/Sidebar'

const metrics = [
  { label: 'Total Anggota', value: 48, sub: '3 tim aktif' },
  { label: 'Tugas Aktif', value: 12, sub: '3 pending review' },
  { label: 'Hadir Hari Ini', value: 41, sub: '85% kehadiran', green: true },
  { label: 'Tugas Selesai', value: 7, sub: 'bulan ini', green: true },
]

const aktivitas = [
  { inisial: 'SG', warna: 'bg-emerald-100 text-emerald-800', nama: 'Sergius', tim: 'Tim Alpha', tugas: 'Proposal Desain UI', status: 'Selesai', statusWarna: 'bg-emerald-100 text-emerald-700' },
  { inisial: 'AK', warna: 'bg-blue-100 text-blue-800', nama: 'Akbar', tim: 'Tim Beta', tugas: 'Laporan Bulanan', status: 'Review', statusWarna: 'bg-amber-100 text-amber-700' },
  { inisial: 'PR', warna: 'bg-orange-100 text-orange-800', nama: 'Pradiza', tim: 'Tim Alpha', tugas: 'Database Setup', status: 'Proses', statusWarna: 'bg-blue-100 text-blue-700' },
]

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Dashboard" />
      <main className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-medium">Selamat datang, Sergius</h1>
            <p className="text-sm text-gray-400 mt-0.5">Senin, 13 April 2026</p>
          </div>
          <div className="flex gap-2">
            <button className="border border-gray-200 text-sm px-4 py-2 rounded-xl hover:bg-gray-50">Filter</button>
            <button className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800">+ Buat Tim</button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {metrics.map(m => (
            <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">{m.label}</p>
              <p className="text-2xl font-medium">{m.value}</p>
              <p className={`text-xs mt-1 ${m.green ? 'text-emerald-600' : 'text-gray-400'}`}>{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Baris Bawah */}
        <div className="grid grid-cols-2 gap-4">
          {/* Aktivitas Terbaru */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-3">Aktivitas Terbaru</p>
            {aktivitas.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${a.warna}`}>
                  {a.inisial}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.tugas}</p>
                  <p className="text-xs text-gray-400">{a.nama} · {a.tim}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${a.statusWarna}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          {/* Pending Approval */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-3">Pending Approval</p>
            <div className="flex flex-col gap-2 mb-4">
              {[
                { tugas: 'Proposal Desain UI', info: 'Sergius · Alpha' },
                { tugas: 'Laporan Keuangan', info: 'Akbar · Beta' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">{item.tugas}</p>
                    <span className="text-xs text-gray-400">{item.info}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-black text-white text-xs py-1.5 rounded-lg">Approve</button>
                    <button className="flex-1 border border-gray-200 text-xs py-1.5 rounded-lg">Revisi</button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-3">Status Absensi</p>
            {[
              { label: 'Hadir', val: '41/48', persen: 85, warna: 'bg-emerald-500' },
              { label: 'Izin', val: '5/48', persen: 10, warna: 'bg-amber-400' },
              { label: 'Alpha', val: '2/48', persen: 4, warna: 'bg-red-400' },
            ].map(s => (
              <div key={s.label} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{s.label}</span>
                  <span className="font-medium">{s.val}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.warna}`} style={{ width: `${s.persen}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
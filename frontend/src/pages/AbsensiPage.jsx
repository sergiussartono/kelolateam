import { useState } from 'react'
import Layout from '../components/Layout'
import { dummyAttendances } from '../data/dummy'
import { MapPin, Clock, CheckCircle, X } from 'lucide-react'

const statusStyle = {
  hadir: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  lambat: { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  izin: { badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  alpha: { badge: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
}

const statusLabel = { hadir: 'Hadir', lambat: 'Terlambat', izin: 'Izin', alpha: 'Alpha' }

export default function AbsensiPage() {
  const [attendances] = useState(dummyAttendances)
  const [showIzin, setShowIzin] = useState(false)
  const [izinForm, setIzinForm] = useState({ alasan: '', keterangan: '' })
  const [locationVerified] = useState(true) // simulasi geofencing

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const counts = {
    hadir: attendances.filter(a => a.status === 'hadir').length,
    lambat: attendances.filter(a => a.status === 'lambat').length,
    izin: attendances.filter(a => a.status === 'izin').length,
    alpha: attendances.filter(a => a.status === 'alpha').length,
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Absensi Cerdas</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{today}</p>
        </div>
        <button
          onClick={() => setShowIzin(true)}
          className="border border-gray-200 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          + Ajukan Izin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Hadir', value: counts.hadir, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Terlambat', value: counts.lambat, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Izin', value: counts.izin, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Alpha', value: counts.alpha, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">dari {attendances.length} anggota</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Tabel Kehadiran */}
        <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Rekap Kehadiran Hari Ini</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left pb-2">Anggota</th>
                <th className="text-left pb-2">Tim</th>
                <th className="text-left pb-2">Jam Masuk</th>
                <th className="text-left pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(a => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${a.color}`}>{a.avatar}</div>
                      <span className="font-medium">{a.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500 text-xs">{a.team}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock size={11} />
                      {a.clock_in}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[a.status].badge}`}>
                      {statusLabel[a.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel Kanan */}
        <div className="flex flex-col gap-4">
          {/* Geofencing Status */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Verifikasi Lokasi</p>
            <div className="bg-gray-50 rounded-xl h-32 flex items-center justify-center flex-col gap-2 border border-dashed border-gray-200 mb-3">
              <div className={`w-4 h-4 rounded-full border-4 border-white shadow ${locationVerified ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ outline: `3px solid ${locationVerified ? '#9FE1CB' : '#F09595'}` }} />
              <p className="text-xs text-gray-500">{locationVerified ? 'Lokasi terverifikasi' : 'Di luar radius'}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={12} />
              <span>Radius 100m dari titik kantor</span>
            </div>
            {locationVerified && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 mt-1">
                <CheckCircle size={12} />
                <span>Dalam radius — absensi valid</span>
              </div>
            )}
          </div>

          {/* Progress Kehadiran Bulanan */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Kehadiran Bulan Ini</p>
            {[
              { nama: 'Tim Alpha', persen: 88 },
              { nama: 'Tim Beta', persen: 92 },
              { nama: 'Tim Gamma', persen: 78 },
            ].map(t => (
              <div key={t.nama} className="mb-2.5 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{t.nama}</span>
                  <span className={`font-medium ${t.persen >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{t.persen}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${t.persen >= 85 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${t.persen}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Ajukan Izin */}
      {showIzin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[380px] shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Ajukan Izin</h2>
              <button onClick={() => setShowIzin(false)} className="text-gray-400 hover:text-black"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Jenis Izin</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
                  value={izinForm.alasan}
                  onChange={e => setIzinForm({ ...izinForm, alasan: e.target.value })}
                >
                  <option value="">Pilih jenis izin</option>
                  <option value="sakit">Izin Sakit</option>
                  <option value="keperluan">Keperluan Pribadi</option>
                  <option value="dinas">Perjalanan Dinas</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Keterangan</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black h-24 resize-none"
                  placeholder="Jelaskan alasan izin..."
                  value={izinForm.keterangan}
                  onChange={e => setIzinForm({ ...izinForm, keterangan: e.target.value })}
                />
              </div>
              <button
                onClick={() => setShowIzin(false)}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
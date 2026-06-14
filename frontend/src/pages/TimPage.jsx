import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import teamService from '../services/teamService'
import { Plus, X, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Warna progress bar berdasarkan kapasitas
const barColor = (cap) => {
  if (cap >= 75) return 'bg-red-400'
  if (cap >= 50) return 'bg-amber-400'
  return 'bg-emerald-500'
}

const capColor = (cap) => {
  if (cap >= 75) return 'text-red-600'
  if (cap >= 50) return 'text-amber-600'
  return 'text-emerald-600'
}

const statusBadge = {
  aktif: 'bg-emerald-100 text-emerald-700',
  baru:  'bg-gray-100 text-gray-600',
  arsip: 'bg-red-100 text-red-600',
}

// Hitung kapasitas dari jumlah tugas aktif vs total anggota
const hitungKapasitas = (team) => {
  const aktivTugas = team.tasks?.filter(t => ['todo','doing','review'].includes(t.status)).length ?? 0
  const anggota = team.members?.length ?? 1
  return Math.min(Math.round((aktivTugas / (anggota * 2)) * 100), 100)
}

export default function TimPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', category: '', status: 'baru' })

  useEffect(() => { fetchTeams() }, [])

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const res = await teamService.getAll()
      setTeams(res.data ?? [])
    } catch {
      toast.error('Gagal memuat data tim')
    } finally {
      setLoading(false)
    }
  }

  const handleBuatTim = async () => {
    if (!newTeam.name || !newTeam.category) {
      toast.error('Nama dan kategori wajib diisi')
      return
    }
    setSubmitting(true)
    try {
      const res = await teamService.create(newTeam)
      setTeams(prev => [...prev, res.data])
      setNewTeam({ name: '', category: '', status: 'baru' })
      setShowModal(false)
      toast.success('Tim berhasil dibuat!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat tim')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHapusTim = async (id) => {
    if (!confirm('Yakin hapus tim ini?')) return
    try {
      await teamService.remove(id)
      setTeams(prev => prev.filter(t => t.id !== id))
      if (selectedTeam?.id === id) setSelectedTeam(null)
      toast.success('Tim dihapus')
    } catch {
      toast.error('Gagal menghapus tim')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat data tim...</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Kelola Tim</h1>
          <p className="text-sm text-gray-400 mt-0.5">{teams.length} tim · {teams.reduce((a, t) => a + (t.members?.length ?? 0), 0)} anggota</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Plus size={14} /> Buat Tim
        </button>
      </div>

      {/* Team Cards */}
      {teams.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">Belum ada tim. Buat tim pertamamu!</div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {teams.map(team => {
            const cap = team.capacity_percentage ?? hitungKapasitas(team)
            return (
              <div key={team.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="h-1 bg-black" />
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-sm">{team.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{team.category}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[team.status] ?? statusBadge.baru}`}>
                      {team.status?.charAt(0).toUpperCase() + team.status?.slice(1)}
                    </span>
                  </div>

                  {/* Progress Kapasitas */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">Kesibukan tim</span>
                      <span className={`font-medium ${capColor(cap)}`}>{cap}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor(cap)}`} style={{ width: `${cap}%` }} />
                    </div>
                  </div>

                  {/* Avatar Anggota */}
                  <div className="flex items-center mb-3">
                    {team.members?.slice(0, 3).map((m, i) => (
                      <div key={m.id}
                        className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium border-2 border-white"
                        style={{ marginLeft: i > 0 ? '-8px' : '0' }}
                        title={m.name}>
                        {m.name?.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {(team.members?.length ?? 0) > 3 && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium border-2 border-white" style={{ marginLeft: '-8px' }}>
                        +{team.members.length - 3}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mb-3">
                    {team.members?.length ?? 0} anggota · {team.tasks?.filter(t => ['todo','doing','review'].includes(t.status)).length ?? 0} tugas aktif
                  </p>

                  <div className="flex gap-2">
                    <button onClick={() => setSelectedTeam(team)}
                      className="flex-1 bg-black text-white text-xs py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      Kelola
                    </button>
                    <button onClick={() => handleHapusTim(team.id)}
                      className="flex-1 border border-gray-200 text-xs py-2 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Warning overload */}
                {cap >= 75 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-t border-red-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-red-600">Tim ini sedang sangat sibuk</span>
                  </div>
                )}
                {cap >= 50 && cap < 75 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-t border-amber-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-amber-700">Tim ini sedang sibuk</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Anggota */}
      {selectedTeam && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <p className="font-semibold">{selectedTeam.name} — Daftar Anggota</p>
            </div>
            <button onClick={() => setSelectedTeam(null)} className="text-gray-400 hover:text-black">
              <X size={16} />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left pb-2">Nama</th>
                <th className="text-left pb-2">Email</th>
                <th className="text-left pb-2">Role</th>
                <th className="text-left pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedTeam.members?.map(m => (
                <tr key={m.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                        {m.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-gray-400">{m.email}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                      ${m.pivot?.role === 'leader' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {m.pivot?.role === 'leader' ? 'Leader' : 'Member'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full
                        ${m.pivot?.status_online === 'online' ? 'bg-emerald-500'
                          : m.pivot?.status_online === 'away' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-500 capitalize">{m.pivot?.status_online ?? 'offline'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Buat Tim */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[380px] shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Buat Tim Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Nama Tim</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                  placeholder="Contoh: Tim Alpha"
                  value={newTeam.name}
                  onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Kategori</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                  placeholder="Contoh: Pengembangan Produk"
                  value={newTeam.category}
                  onChange={e => setNewTeam({ ...newTeam, category: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Status</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
                  value={newTeam.status}
                  onChange={e => setNewTeam({ ...newTeam, status: e.target.value })}
                >
                  <option value="baru">Baru</option>
                  <option value="aktif">Aktif</option>
                  <option value="arsip">Arsip</option>
                </select>
              </div>
              <button onClick={handleBuatTim} disabled={submitting}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-colors">
                {submitting ? 'Membuat...' : 'Buat Tim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
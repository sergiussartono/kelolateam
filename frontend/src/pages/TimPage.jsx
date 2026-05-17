import { useState } from 'react'
import Layout from '../components/Layout'
import { dummyTeams } from '../data/dummy'
import { Users, Plus, X } from 'lucide-react'

const warnStyle = {
  red: { wrap: 'bg-red-50 border-t border-red-100', dot: 'bg-red-500', text: 'text-red-600', label: 'Tim ini sedang sangat sibuk' },
  amber: { wrap: 'bg-amber-50 border-t border-amber-100', dot: 'bg-amber-500', text: 'text-amber-700', label: 'Tim ini sedang sibuk' },
  none: null,
}

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
  baru: 'bg-gray-100 text-gray-600',
  arsip: 'bg-red-100 text-red-600',
}

export default function TimPage() {
  const [teams, setTeams] = useState(dummyTeams)
  const [showModal, setShowModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [newTeam, setNewTeam] = useState({ name: '', category: '' })

  const handleBuatTim = () => {
    if (!newTeam.name || !newTeam.category) return
    const tim = {
      id: teams.length + 1,
      name: newTeam.name,
      category: newTeam.category,
      status: 'baru',
      capacity: 0,
      memberCount: 0,
      taskCount: 0,
      color: 'bg-gray-400',
      warn: 'none',
      members: [],
    }
    setTeams([...teams, tim])
    setNewTeam({ name: '', category: '' })
    setShowModal(false)
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Kelola Tim</h1>
          <p className="text-sm text-gray-400 mt-0.5">{teams.length} tim aktif · 48 anggota</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Buat Tim
        </button>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {teams.map(team => {
          const warn = warnStyle[team.warn]
          return (
            <div key={team.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className={`h-1 ${team.color}`} />
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm">{team.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{team.category}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[team.status]}`}>
                    {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Kesibukan tim</span>
                    <span className={`font-medium ${capColor(team.capacity)}`}>{team.capacity}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor(team.capacity)}`} style={{ width: `${team.capacity}%` }} />
                  </div>
                </div>

                {/* Avatars */}
                <div className="flex items-center mb-3">
                  {team.members.slice(0, 3).map((m, i) => (
                    <div
                      key={m.id}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white ${m.color}`}
                      style={{ marginLeft: i > 0 ? '-8px' : '0' }}
                    >
                      {m.avatar}
                    </div>
                  ))}
                  {team.memberCount > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium border-2 border-white" style={{ marginLeft: '-8px' }}>
                      +{team.memberCount - 3}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-3">{team.memberCount} anggota · {team.taskCount} tugas aktif</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTeam(team)}
                    className="flex-1 bg-black text-white text-xs py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Kelola
                  </button>
                  <button className="flex-1 border border-gray-200 text-xs py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Undang
                  </button>
                </div>
              </div>

              {warn && (
                <div className={`flex items-center gap-2 px-4 py-2 ${warn.wrap}`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${warn.dot}`} />
                  <span className={`text-xs font-medium ${warn.text}`}>{warn.label}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail Anggota (jika tim dipilih) */}
      {selectedTeam && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">{selectedTeam.name} — Daftar Anggota</p>
            <button onClick={() => setSelectedTeam(null)} className="text-gray-400 hover:text-black">
              <X size={16} />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left pb-2">Nama</th>
                <th className="text-left pb-2">Role</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-left pb-2">Tugas Aktif</th>
              </tr>
            </thead>
            <tbody>
              {selectedTeam.members.map(m => (
                <tr key={m.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${m.color}`}>{m.avatar}</div>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.role === 'leader' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {m.role === 'leader' ? 'Leader' : 'Member'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${m.status_online === 'online' ? 'bg-emerald-500' : m.status_online === 'away' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-500 capitalize">{m.status_online}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">{m.taskCount} tugas</td>
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
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-all"
                  placeholder="Contoh: Tim Alpha"
                  value={newTeam.name}
                  onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Kategori</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-all"
                  placeholder="Contoh: Pengembangan Produk"
                  value={newTeam.category}
                  onChange={e => setNewTeam({ ...newTeam, category: e.target.value })}
                />
              </div>
              <button
                onClick={handleBuatTim}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Buat Tim
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
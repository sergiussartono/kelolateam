import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import taskService from '../services/taskService'
import teamService from '../services/teamService'
import { Plus, X, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'

const columns = [
  { key: 'todo',     label: 'Belum Dikerjakan', dot: 'bg-gray-400',    count: 'bg-gray-100 text-gray-600' },
  { key: 'doing',    label: 'Sedang Dikerjakan', dot: 'bg-blue-400',   count: 'bg-blue-100 text-blue-700' },
  { key: 'review',   label: 'Review / Selesai',  dot: 'bg-amber-400',  count: 'bg-amber-100 text-amber-700' },
  { key: 'approved', label: 'Diapprove',          dot: 'bg-emerald-500', count: 'bg-emerald-100 text-emerald-700' },
]

const priorityBadge = {
  urgent: 'bg-red-100 text-red-600',
  normal: 'bg-gray-100 text-gray-600',
  low:    'bg-blue-100 text-blue-600',
}

export default function TugasPage() {
  const [tasks, setTasks]   = useState([])
  const [teams, setTeams]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '', description: '', team_id: '',
    priority: 'normal', due_date: '', status: 'todo', progress: 0,
  })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [taskRes, teamRes] = await Promise.all([
        taskService.getAll(),
        teamService.getAll(),
      ])
      setTasks(taskRes.data ?? [])
      setTeams(teamRes.data ?? [])
    } catch {
      toast.error('Gagal memuat data tugas')
    } finally {
      setLoading(false)
    }
  }

  const getByStatus = (status) => tasks.filter(t => t.status === status)

  // Update status tugas (approve / revisi / dll)
  const handleUpdateStatus = async (id, status) => {
    try {
      await taskService.updateStatus(id, status)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      toast.success(status === 'approved' ? 'Tugas diapprove!' : 'Tugas dikembalikan untuk revisi')
    } catch {
      toast.error('Gagal mengupdate status')
    }
  }

  const handleBuatTugas = async () => {
    if (!newTask.title || !newTask.team_id || !newTask.due_date) {
      toast.error('Judul, tim, dan deadline wajib diisi')
      return
    }
    setSubmitting(true)
    try {
      const res = await taskService.create(newTask)
      setTasks(prev => [...prev, res.data])
      setNewTask({ title: '', description: '', team_id: '', priority: 'normal', due_date: '', status: 'todo', progress: 0 })
      setShowModal(false)
      toast.success('Tugas berhasil dibuat!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat tugas')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHapus = async (id) => {
    if (!confirm('Yakin hapus tugas ini?')) return
    try {
      await taskService.remove(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      toast.success('Tugas dihapus')
    } catch {
      toast.error('Gagal menghapus tugas')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat data tugas...</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Manajemen Tugas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Board Kanban · {tasks.length} total tugas</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Plus size={14} /> Buat Tugas
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-3">
        {columns.map(col => {
          const colTasks = getByStatus(col.key)
          return (
            <div key={col.key} className="bg-gray-50 rounded-xl p-3">
              {/* Header Kolom */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <p className="text-xs font-semibold text-gray-600 flex-1">{col.label}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.count}`}>{colTasks.length}</span>
              </div>

              {/* Task Cards */}
              <div className="flex flex-col gap-2">
                {colTasks.map(task => (
                  <div key={task.id} className="bg-white border border-gray-100 rounded-xl p-3">
                    {/* Priority & Due */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${priorityBadge[task.priority] ?? priorityBadge.normal}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-[10px] text-gray-400">{task.due_date}</span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-sm font-medium mb-1 leading-snug">{task.title}</p>
                    <p className="text-xs text-gray-400 mb-2">{task.team?.name ?? '—'}</p>

                    {/* Progress */}
                    {task.progress > 0 && (
                      <div className="mb-2">
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${task.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{task.progress}%</p>
                      </div>
                    )}

                    {/* Assignee */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-medium">
                          {task.assignee?.name?.slice(0, 2).toUpperCase() ?? 'NA'}
                        </div>
                        <span className="text-xs text-gray-500">{task.assignee?.name ?? '—'}</span>
                      </div>
                      <button onClick={() => handleHapus(task.id)}
                        className="text-[10px] text-gray-300 hover:text-red-400 transition-colors">
                        hapus
                      </button>
                    </div>

                    {/* Action Buttons */}
                    {task.status === 'review' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleUpdateStatus(task.id, 'approved')}
                          className="flex-1 bg-black text-white text-[10px] py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                          Approve
                        </button>
                        <button onClick={() => handleUpdateStatus(task.id, 'doing')}
                          className="flex-1 border border-gray-200 text-[10px] py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                          Revisi
                        </button>
                      </div>
                    )}

                    {task.status === 'doing' && (
                      <button onClick={() => handleUpdateStatus(task.id, 'review')}
                        className="w-full border border-gray-200 text-[10px] py-1.5 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors">
                        <Upload size={10} /> Submit Review
                      </button>
                    )}

                    {task.status === 'todo' && (
                      <button onClick={() => handleUpdateStatus(task.id, 'doing')}
                        className="w-full border border-gray-200 text-[10px] py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        Mulai Kerjakan
                      </button>
                    )}
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-300">Tidak ada tugas</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Buat Tugas */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Buat Tugas Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Judul Tugas</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                  placeholder="Contoh: Desain Landing Page"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Deskripsi</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black h-20 resize-none"
                  placeholder="Deskripsi tugas..."
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Tim</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
                  value={newTask.team_id}
                  onChange={e => setNewTask({ ...newTask, team_id: e.target.value })}
                >
                  <option value="">Pilih tim</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-medium">Prioritas</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="urgent">Urgent</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-medium">Deadline</label>
                  <input type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                    value={newTask.due_date}
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
              <button onClick={handleBuatTugas} disabled={submitting}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-colors">
                {submitting ? 'Membuat...' : 'Buat Tugas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
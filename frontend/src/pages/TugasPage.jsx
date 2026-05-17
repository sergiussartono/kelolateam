import { useState } from 'react'
import Layout from '../components/Layout'
import { dummyTasks } from '../data/dummy'
import { Plus, X, Upload } from 'lucide-react'

const columns = [
  { key: 'todo', label: 'Belum Dikerjakan', color: 'bg-gray-400', count_color: 'bg-gray-100 text-gray-600' },
  { key: 'doing', label: 'Sedang Dikerjakan', color: 'bg-blue-400', count_color: 'bg-blue-100 text-blue-700' },
  { key: 'review', label: 'Review / Selesai', color: 'bg-amber-400', count_color: 'bg-amber-100 text-amber-700' },
  { key: 'approved', label: 'Diapprove', color: 'bg-emerald-500', count_color: 'bg-emerald-100 text-emerald-700' },
]

const priorityBadge = {
  urgent: 'bg-red-100 text-red-600',
  normal: 'bg-gray-100 text-gray-600',
  low: 'bg-blue-100 text-blue-600',
}

export default function TugasPage() {
  const [tasks, setTasks] = useState(dummyTasks)
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', team: '', assignee: '', priority: 'normal', due_date: '' })

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  const handleApprove = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'approved' } : t))
  }

  const handleRevisi = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'doing' } : t))
  }

  const handleBuatTugas = () => {
    if (!newTask.title) return
    const task = {
      id: tasks.length + 1,
      title: newTask.title,
      team: newTask.team || 'Tim Alpha',
      assignee: newTask.assignee || 'Sergius',
      avatar: 'SG',
      avatarColor: 'bg-emerald-100 text-emerald-800',
      priority: newTask.priority,
      status: 'todo',
      due_date: newTask.due_date,
      progress: 0,
    }
    setTasks([...tasks, task])
    setNewTask({ title: '', team: '', assignee: '', priority: 'normal', due_date: '' })
    setShowModal(false)
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Manajemen Tugas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Board Kanban · {tasks.length} total tugas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Buat Tugas
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-3">
        {columns.map(col => {
          const colTasks = getTasksByStatus(col.key)
          return (
            <div key={col.key} className="bg-gray-50 rounded-xl p-3">
              {/* Header Kolom */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <p className="text-xs font-semibold text-gray-600 flex-1">{col.label}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.count_color}`}>{colTasks.length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {colTasks.map(task => (
                  <div key={task.id} className="bg-white border border-gray-100 rounded-xl p-3">
                    {/* Priority & Due */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${priorityBadge[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-[10px] text-gray-400">{task.due_date}</span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-sm font-medium mb-1 leading-snug">{task.title}</p>
                    <p className="text-xs text-gray-400 mb-2">{task.team}</p>

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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${task.avatarColor}`}>
                          {task.avatar}
                        </div>
                        <span className="text-xs text-gray-500">{task.assignee}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {task.status === 'review' && (
                      <div className="flex gap-1.5 mt-2">
                        <button
                          onClick={() => handleApprove(task.id)}
                          className="flex-1 bg-black text-white text-[10px] py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRevisi(task.id)}
                          className="flex-1 border border-gray-200 text-[10px] py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Revisi
                        </button>
                      </div>
                    )}

                    {task.status === 'todo' && (
                      <button className="w-full mt-2 border border-gray-200 text-[10px] py-1.5 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors">
                        <Upload size={10} /> Kerjakan & Upload
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
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-medium">Tim</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                    placeholder="Tim Alpha"
                    value={newTask.team}
                    onChange={e => setNewTask({ ...newTask, team: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-medium">Assignee</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                    placeholder="Nama anggota"
                    value={newTask.assignee}
                    onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                  />
                </div>
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
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                    value={newTask.due_date}
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
              <button
                onClick={handleBuatTugas}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Buat Tugas
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
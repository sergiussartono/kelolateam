import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import taskService from '../services/taskService'
import teamService from '../services/teamService'
import { Plus, X, Upload, FileText, CheckCircle2, Paperclip, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/authStore' // 1. Pastikan useAuthStore di-import dengan benar

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
  // 2. Ambil data user dari Zustand store di dalam komponen utama
  const { user } = useAuthStore()

  const [tasks, setTasks]   = useState([])
  const [teams, setTeams]   = useState([])
  const [loading, setLoading] = useState(true)
  
  // State navigasi tab khusus mobile agar Kanban rapi
  const [activeTab, setActiveTab] = useState('todo')

  // Modal Buat Tugas
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '', description: '', team_id: '',
    priority: 'normal', due_date: '', status: 'todo', progress: 0,
  })

  // Modal khusus Upload Tugas (Saat member klik "Submit Review")
  const [uploadModal, setUploadModal] = useState({ isOpen: false, taskId: null })
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // 3. Logika Saringan FE: Ambil daftar tim yang mana user login bertindak sebagai 'leader'
   const leaderTeams = useMemo(() =>
    teams.filter(team =>
      team.members?.some(m => m.id === user.id && m.pivot?.role === 'leader')
    )
  , [user, teams])
  const isUserLeader = leaderTeams.length > 0
  

  useEffect(() => { 
    fetchAll()
  }, [user?.id])

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
    
  const handleUpdateStatus = async (id, status) => {
    try {
      await taskService.updateStatus(id, status)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      toast.success(status === 'doing' ? 'Tugas mulai dikerjakan!' : 'Status tugas diperbarui')
    } catch {
      toast.error('Gagal mengupdate status')
    }
  }

  const triggerSubmitReview = (taskId) => {
    setSelectedFile(null)
    setUploadModal({ isOpen: true, taskId })
  }

  const handleUploadDanSubmit = async () => {
    if (!selectedFile) {
      toast.error('Wajib mengunggah file atau gambar bukti tugas!')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('status', 'review')
    formData.append('progress', 100)

    try {
      const res = await taskService.update(uploadModal.taskId, formData)
      setTasks(prev => prev.map(t => t.id === uploadModal.taskId ? res.data : t))
      setUploadModal({ isOpen: false, taskId: null })
      toast.success('Tugas berhasil diupload dan diajukan ke review!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim lampiran tugas')
    } finally {
      setUploading(false)
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

  const handlePreview = async (taskId) => {
    try {
      toast.loading('Memuat pratinjau berkas...', { id: 'preview-loading' })
      const response = await api.get(`/tasks/view-file/${taskId}`, { responseType: 'blob' })
      const contentType = response.headers['content-type']
      const fileBlob = new Blob([response.data], { type: contentType })
      const fileURL = URL.createObjectURL(fileBlob)
      toast.dismiss('preview-loading')
      window.open(fileURL, '_blank')
    } catch (err) {
      toast.dismiss('preview-loading')
      console.error("Detail Error KelolaTeam Preview:", err.response || err)
      toast.error('Gagal membuka berkas. Anda mungkin tidak memiliki akses atau token kedaluwarsa.')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat data tugas...</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header Responsif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold">Manajemen Tugas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Board Kanban · {tasks.length} total tugas</p>
        </div>
        
        {/* 4. Kunci Tombol Utama: Hanya tampilkan tombol "Buat Tugas" jika user adalah leader di minimal 1 grup */}
        {isUserLeader && (
          <button onClick={() => setShowModal(true)}
            className="bg-black text-white text-sm px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={14} /> Buat Tugas
          </button>
        )}
      </div>

      {/* TAMPILAN MOBILE: Navigasi Tab */}
      <div className="sm:hidden flex border-b border-gray-200 mb-4 overflow-x-auto">
        {columns.map(col => (
          <button
            key={col.key}
            onClick={() => setActiveTab(col.key)}
            className={`flex-1 py-2 px-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center justify-center gap-1.5
              ${activeTab === col.key ? 'border-black text-black font-semibold' : 'border-transparent text-gray-400'}`}
          >
            {col.label}
            <span className="px-1.5 py-0.2 bg-gray-100 text-[10px] text-gray-600 rounded-full">{getByStatus(col.key).length}</span>
          </button>
        ))}
      </div>

      {/* KANBAN BOARD CONTAINER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => {
          const colTasks = getByStatus(col.key)
          return (
            <div key={col.key} className={`bg-gray-50 rounded-xl p-3 flex flex-col min-h-[250px] sm:block ${activeTab === col.key ? 'block' : 'hidden sm:block'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <p className="text-xs font-semibold text-gray-600 flex-1">{col.label}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.count}`}>{colTasks.length}</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {colTasks.map(task => {
                  // Cek peran user secara spesifik di dalam tim tugas ini saat ini
                  const currentTeamData = user?.teams?.find(t => t.id === task.team_id)
                  const isLeaderInThisTeam = currentTeamData?.pivot?.role === 'leader'

                  return (
                    <div key={task.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${priorityBadge[task.priority] ?? priorityBadge.normal}`}>
                          {task.priority}
                        </span>
                        {task.due_date && <span className="text-[10px] text-gray-400">{task.due_date}</span>}
                      </div>

                      <p className="text-sm font-medium mb-1 leading-snug text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-400 mb-2">{task.team?.name ?? '—'}</p>

                      <div className="mb-3">
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-black rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">Progress pengerjaan: {task.progress}%</p>
                      </div>

                      {task.file_path && (
                        <div className="mb-3 p-1.5 bg-gray-50 rounded-lg flex items-center gap-1 text-[10px] text-gray-500 truncate">
                          <Paperclip size={10} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{task.file_path.split('/').pop()}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3 border-t border-gray-50 pt-2.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                            {task.assignee?.name?.slice(0, 2).toUpperCase() ?? 'NA'}
                          </div>
                          <span className="text-xs text-gray-500 truncate">{task.assignee?.name ?? '—'}</span>
                        </div>
                        
                        {/* Hapus hanya bisa dilakukan oleh leader di tim tersebut */}
                        {isLeaderInThisTeam && (
                          <button onClick={() => handleHapus(task.id)}
                            className="text-[10px] text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                            hapus
                          </button>
                        )}
                      </div>

                      <div className="mt-2">
                        {task.status === 'todo' && (
                          <button onClick={() => handleUpdateStatus(task.id, 'doing')}
                            className="w-full bg-white border border-gray-200 text-gray-700 font-medium text-[11px] py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            Mulai Kerjakan
                          </button>
                        )}

                        {task.status === 'doing' && (
                          <button onClick={() => triggerSubmitReview(task.id)}
                            className="w-full bg-black text-white font-medium text-[11px] py-1.5 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-1 transition-colors">
                            <Upload size={11} /> Submit Tugas
                          </button>
                        )}

                        {task.status === 'review' && (
                          <div>
                            {task.file_path && (
                              <div 
                                onClick={() => handlePreview(task.id)}
                                className="mb-3 p-1.5 bg-gray-50 rounded-lg flex items-center gap-1 text-[10px] text-gray-500 truncate cursor-pointer hover:bg-gray-100"
                                title="Klik untuk pratinjau berkas"
                              >
                                <Paperclip size={10} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{task.file_path.split('/').pop()}</span>
                              </div>
                            )}
                            
                            {/* 5. Aksi Approve/Revisi dikunci agar hanya bisa di-klik oleh Leader asli di tim tersebut */}
                            {isLeaderInThisTeam ? (
                              <div className="flex gap-1.5">
                                <button onClick={() => handleUpdateStatus(task.id, 'approved')}
                                  className="flex-1 bg-emerald-600 text-white font-medium text-[11px] py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                                  Approve
                                </button>
                                <button onClick={() => handleUpdateStatus(task.id, 'doing')}
                                  className="flex-1 border border-gray-200 text-gray-600 font-medium text-[11px] py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                  Revisi
                                </button>
                              </div>
                            ) : (
                              <div className="text-center p-1.5 bg-amber-50 text-amber-700 text-[10px] rounded-lg font-medium">
                                Menunggu review leader...
                              </div>
                            )}
                          </div>
                        )}

                        {task.status === 'approved' && (
                          <div className="flex items-center justify-center gap-1 text-emerald-600 text-[11px] font-medium py-1">
                            <CheckCircle2 size={12} /> Selesai Terverifikasi
                          </div>
                        )}
                      </div>

                    </div>
                  )
                })}

                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-300 bg-white border border-dashed border-gray-200 rounded-xl">Tidak ada tugas</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* --- MODAL UPLOAD HASIL TUGAS --- */}
      {uploadModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-[92%] sm:w-[380px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1.5">
                <Upload size={16} /> Lampirkan Hasil Tugas
              </h2>
              <button onClick={() => setUploadModal({ isOpen: false, taskId: null })} className="text-gray-400 hover:text-black"><X size={16} /></button>
            </div>
            
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Sebelum mengirimkan tugas ke tim review pemimpin, Anda diwajibkan mengunggah berkas/gambar laporan pengerjaan.
            </p>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-black transition-colors relative bg-gray-50">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={e => setSelectedFile(e.target.files[0])}
                />
                <div className="flex flex-col items-center gap-1.5">
                  <FileText size={24} className="text-gray-400" />
                  <p className="text-xs font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : 'Pilih File atau Gambar'}
                  </p>
                  <p className="text-[10px] text-gray-400">PNG, JPG, PDF, DOCX, ZIP (Max 5MB)</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setUploadModal({ isOpen: false, taskId: null })}
                  className="px-4 py-2 border border-gray-200 text-xs font-medium rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUploadDanSubmit}
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 bg-black text-white text-xs font-medium rounded-xl hover:bg-gray-800 disabled:opacity-40 flex items-center gap-1"
                >
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : null}
                  Kirim Tugas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL BUAT TUGAS BARU --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-[92%] sm:w-[420px] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-sm sm:text-base">Buat Tugas Baru</h2>
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
                  {/* 6. Seleksi Dropdown Dinamis: Melakukan perulangan hanya dari tim yang dipimpin */}
                  {leaderTeams.length === 0 ? (
                    <option value="">Tidak ada grup yang Anda pimpin</option>
                  ) : (
                    <>
                      <option value="">Pilih tim yang Anda pimpin</option>
                      {leaderTeams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </>
                  )}
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
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
                    value={newTask.due_date}
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
              <button onClick={handleBuatTugas} disabled={submitting}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-colors mt-2">
                {submitting ? 'Membuat...' : 'Buat Tugas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
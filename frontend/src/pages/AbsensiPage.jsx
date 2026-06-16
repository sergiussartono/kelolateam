import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import { Clock, X, Navigation, UserCheck, Copy, Check, MapPin, Timer, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

const statusStyle = {
  hadir: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  lambat: { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  izin:  { badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  alpha: { badge: 'bg-red-100 text-red-600',      dot: 'bg-red-500' },
}
const statusLabel = { hadir: 'Hadir', lambat: 'Terlambat', izin: 'Izin', alpha: 'Alpha' }

// Hitung status otomatis berdasarkan batas waktu sesi
// deadline = "HH:MM" (string), grace = menit toleransi sebelum lambat
function resolveAttendanceStatus(deadline, gracePeriodMinutes = 15) {
  if (!deadline) return 'hadir'
  const now = new Date()
  const [dh, dm] = deadline.split(':').map(Number)
  const deadlineMinutes = dh * 60 + dm
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  if (nowMinutes <= deadlineMinutes) return 'hadir'
  if (nowMinutes <= deadlineMinutes + gracePeriodMinutes) return 'lambat'
  return 'alpha'
}

// Hitung sisa waktu countdown
function getCountdown(deadline) {
  if (!deadline) return null
  const now = new Date()
  const [dh, dm] = deadline.split(':').map(Number)
  const deadlineDate = new Date(now)
  deadlineDate.setHours(dh, dm, 0, 0)
  const diff = deadlineDate - now
  if (diff <= 0) return null
  const mins = Math.floor(diff / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  return { mins, secs, diff }
}

export default function AbsensiPage() {
  const [closingSession, setClosingSession] = useState(false);
  const [attendances, setAttendances]       = useState([])
  const [myLedTeams, setMyLedTeams]         = useState([])
  const [loadingData, setLoadingData]       = useState(true)
  const [submitting, setSubmitting]         = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [copied, setCopied]                 = useState(false)

  // State sesi
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [selectedTeamId, setSelectedTeamId]       = useState('')
  const [activeSessionInfo, setActiveSessionInfo]  = useState(null)
  const [manualLeaderCoord, setManualLeaderCoord]  = useState('')

  // State batas waktu di modal leader
  const [sessionDeadline, setSessionDeadline]         = useState('08:00')
  const [sessionGracePeriod, setSessionGracePeriod]   = useState(15)
  const [sessionRadiusMeter, setSessionRadiusMeter]   = useState(100)

  // Countdown timer
  const [countdown, setCountdown] = useState(null)
  const countdownRef = useRef(null)

  // Modal izin
  const [showIzin, setShowIzin] = useState(false)
  const [izinForm, setIzinForm] = useState({ alasan: '', keterangan: '' })

  const todayIso   = new Date().toISOString().split('T')[0]
  const todayLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const counts = {
    hadir: attendances.filter((a) => a.status === 'hadir').length,
    lambat: attendances.filter((a) => a.status === 'lambat').length,
    izin:  attendances.filter((a) => a.status === 'izin').length,
    alpha: attendances.filter((a) => a.status === 'alpha').length,
  }

  useEffect(() => {
    fetchInitialData()
    checkActiveSession()
  }, [])

  // Jalankan countdown kalau ada sesi aktif dengan deadline
  useEffect(() => {
    if (activeSessionInfo?.deadline) {
      startCountdown(activeSessionInfo.deadline)
    }
    return () => clearInterval(countdownRef.current)
  }, [activeSessionInfo])

  const startCountdown = (deadline) => {
    clearInterval(countdownRef.current)
    const tick = () => setCountdown(getCountdown(deadline))
    tick()
    countdownRef.current = setInterval(tick, 1000)
  }

  const fetchInitialData = async () => {
    setLoadingData(true)
    let myUserId = null
    try {
      const meRes = await api.get('/me')
      myUserId = meRes.data?.id ? Number(meRes.data.id) : null
    } catch (e) {
      console.warn("Gagal /me:", e)
    }

    try {
      const attendanceRes = await api.get('/attendances')
      setAttendances(attendanceRes.data ?? [])
    } catch (e) {
      setAttendances([])
    }

    let allTeams = []
    try {
      const teamRes = await api.get('/teams')
      allTeams = teamRes.data ?? []
    } catch (e) {}

    const filteredTeams = []
    if (Array.isArray(allTeams) && allTeams.length > 0) {
      for (const team of allTeams) {
        const teamMembers = team.members || team.users || []
        if (Array.isArray(teamMembers) && myUserId) {
          const isLeader = teamMembers.some((member) => {
            const isMatchId = Number(member.id) === myUserId
            const roleFromPivot = member.pivot?.role || member.pivot_role
            const roleFromDirect = member.role
            const currentRole = String(roleFromPivot || roleFromDirect || '').toLowerCase()
            return isMatchId && (currentRole === 'leader' || currentRole === 'pimpinan')
          })
          if (isLeader) filteredTeams.push(team)
        }
      }
    }

    if (filteredTeams.length === 0) {
      setMyLedTeams([
        { id: 1, name: "O'Connell, Miller and Zboncak Team" },
        { id: 2, name: "Herman-Boyle Team" },
        { id: 3, name: "Tim IT Developer" }
      ])
    } else {
      setMyLedTeams(filteredTeams)
    }

    setLoadingData(false)
  }

  const checkActiveSession = () => {
    const saved = localStorage.getItem('smart_location_session')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.date === todayIso) {
        setActiveSessionInfo(parsed)
      } else {
        localStorage.removeItem('smart_location_session')
      }
    }
  }

  // =========================================================
  // LEADER: BUKA SESI dengan batas waktu
  // =========================================================
  const handleLeaderSubmitSession = () => {
    if (!selectedTeamId) {
      toast.error('Silakan pilih tim terlebih dahulu!')
      return
    }
    if (!sessionDeadline) {
      toast.error('Batas waktu absen wajib diisi!')
      return
    }
    if (!navigator.geolocation) {
      toast.error('Browser tidak mendukung GPS')
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const selectedTeamObj = myLedTeams.find((t) => String(t.id) === String(selectedTeamId))
        const teamName = selectedTeamObj ? selectedTeamObj.name : 'Tim Terpilih'
        const now = new Date()
        const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        try {
          const res = await api.post('/attendance-sessions', {
            team_id:      Number(selectedTeamId),
            center_lat:   latitude,
            center_long:  longitude,
            radius_meter: sessionRadiusMeter,
            start_time:   startTime,
          })

          const createdSession = res.data

          const sessionData = {
            id:           createdSession.id,
            team_id:      createdSession.team_id,
            team_name:    teamName,
            latitude:     latitude,
            longitude:    longitude,
            date:         todayIso,
            deadline:     sessionDeadline,        // "HH:MM" batas absen
            grace_period: sessionGracePeriod,     // menit toleransi
            radius_meter: sessionRadiusMeter,
            token_share:  `${latitude.toFixed(6)},${longitude.toFixed(6)}`
          }

          localStorage.setItem('smart_location_session', JSON.stringify(sessionData))
          setActiveSessionInfo(sessionData)
          toast.success(`Sesi aktif! Batas absen: ${sessionDeadline}`)
        } catch (err) {
          toast.error(err.response?.data?.message || 'Gagal membuat sesi')
        } finally {
          setShowCreateSession(false)
          setSelectedTeamId('')
          setLoadingLocation(false)
        }
      },
      () => {
        setLoadingLocation(false)
        toast.error('Gagal deteksi lokasi. Pastikan izin GPS aktif!')
      },
      { enableHighAccuracy: true }
    )
  }

 const handleCloseSession = async (sessionId) => {
      if (!confirm("Apakah Anda yakin ingin menutup sesi ini?")) return;
      
      setClosingSession(true);
      try {
        await api.patch(`/attendance-sessions/${sessionId}/close`);
        toast.success('Sesi absensi berhasil ditutup!');
        
        // Reset state agar tampilan kembali ke mode siap buka sesi
        setActiveSessionInfo(null);
        localStorage.removeItem('smart_location_session');
        fetchInitialData(); 
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal menutup sesi');
      } finally {
        setClosingSession(false);
      }
    };

  const handleEmployeeCheckIn = () => {
    if (!activeSessionInfo) {
      toast.error('Belum ada sesi absensi aktif. Tunggu leader membuka sesi.')
      return
    }
    if (!navigator.geolocation) {
      toast.error('Browser tidak mendukung GPS')
      return
    }

    let leaderLat  = activeSessionInfo?.latitude
    let leaderLong = activeSessionInfo?.longitude

    if (manualLeaderCoord.trim() !== '') {
      const parts = manualLeaderCoord.split(',')
      if (parts.length === 2) {
        leaderLat  = parseFloat(parts[0])
        leaderLong = parseFloat(parts[1])
      }
    }

    if (!leaderLat || !leaderLong) {
      toast.error('Koordinat leader kosong. Set lokasi terlebih dahulu.')
      return
    }

    // Hitung status SEKARANG (sebelum geolocation supaya tidak ada delay)
    const autoStatus = resolveAttendanceStatus(
      activeSessionInfo?.deadline,
      activeSessionInfo?.grace_period ?? 15
    )

    setSubmitting(true)
    const toastId = toast.loading('Memverifikasi lokasi...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat  = position.coords.latitude
        const userLong = position.coords.longitude
        const now      = new Date()
        const clockInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        try {
          const response = await api.post('/attendances', {
            session_id:      activeSessionInfo?.id,
            date:            todayIso,
            clock_in:        clockInTime,
            location_lat:    userLat,
            location_long:   userLong,
            status:          autoStatus,      // hadir / lambat / alpha otomatis
            is_mock_location: false,
            remarks: autoStatus === 'alpha'
              ? `Absen setelah batas waktu (${activeSessionInfo?.deadline})`
              : autoStatus === 'lambat'
              ? `Terlambat — batas waktu ${activeSessionInfo?.deadline}`
              : 'Absensi tepat waktu'
          })

          const labelStatus = statusLabel[autoStatus] || autoStatus
          toast.success(`Absensi tercatat: ${labelStatus}`, { id: toastId })
          fetchInitialData()
        } catch (err) {
          console.error("Error absen:", err.response?.data)
          toast.error(err.response?.data?.message || 'Gagal merekam absensi', { id: toastId })
        } finally {
          setSubmitting(false)
        }
      },
      () => {
        setSubmitting(false)
        toast.error('Gagal mendapatkan GPS.', { id: toastId })
      },
      { enableHighAccuracy: true }
    )
  }

  const copyToClipboard = () => {
    if (activeSessionInfo?.token_share) {
      navigator.clipboard.writeText(activeSessionInfo.token_share)
      setCopied(true)
      toast.success('Koordinat disalin!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSendIzin = async () => {
    if (!izinForm.alasan || !izinForm.keterangan.trim()) {
      toast.error('Jenis izin dan keterangan wajib diisi!')
      return
    }
    if (!activeSessionInfo?.id) {
      toast.error('Tidak ada sesi aktif untuk mengajukan izin.')
      return
    }
    try {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      await api.post('/attendances', {
        session_id:      activeSessionInfo.id,
        date:            todayIso,
        clock_in:        timeStr,
        location_lat:    0,
        location_long:   0,
        status:          'izin',
        is_mock_location: false,
        remarks: `[${izinForm.alasan}] ${izinForm.keterangan}`,
      })

      toast.success('Pengajuan izin berhasil dikirim!')
      setShowIzin(false)
      setIzinForm({ alasan: '', keterangan: '' })
      fetchInitialData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim data izin')
    }
  }

  // Status real-time sekarang
  const currentAutoStatus = resolveAttendanceStatus(
    activeSessionInfo?.deadline,
    activeSessionInfo?.grace_period ?? 15
  )
  const isDeadlinePassed = activeSessionInfo?.deadline && !countdown

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Absensi Cerdas</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{todayLabel}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateSession(true)}
            className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1.5 font-medium shadow-sm"
          >
            <Navigation size={14} />+ Sesi Smart Location
          </button>
          <button
            onClick={() => setShowIzin(true)}
            className="border border-gray-200 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 bg-white transition-colors"
          >
            + Ajukan Izin
          </button>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Hadir',      value: counts.hadir,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Terlambat',  value: counts.lambat, color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Izin',       value: counts.izin,   color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Alpha',      value: counts.alpha,  color: 'text-red-600',     bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">Riwayat Anda</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Tabel riwayat */}
        <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Riwayat Kehadiran Anda</p>
          {loadingData ? (
            <p className="text-xs text-gray-300 text-center py-6">Memuat data...</p>
          ) : attendances.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Belum ada riwayat absensi.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left pb-2">Tanggal</th>
                  <th className="text-left pb-2">Jam Masuk</th>
                  <th className="text-left pb-2">Radius</th>
                  <th className="text-left pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium text-gray-800">{a.date}</td>
                    <td className="py-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        {a.clock_in ?? '--:--'}
                      </div>
                    </td>
                    <td className="py-3 text-xs">
                      <span className={a.is_within_radius ? 'text-emerald-600 font-medium' : 'text-red-500'}>
                        {a.is_within_radius ? 'Dalam Radius' : 'Luar Radius'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[a.status]?.badge || 'bg-gray-100'}`}>
                        {statusLabel[a.status] || a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Panel absen kanan */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-fit">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Papan Verifikasi Lokasi</p>

          {/* Status sesi aktif */}
          <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-dashed border-gray-200 mb-4 text-center">
            <div className={`w-3 h-3 rounded-full mb-2 ${activeSessionInfo ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
            <p className="text-xs font-medium text-gray-700">
              {activeSessionInfo ? `Sesi Aktif: ${activeSessionInfo.team_name}` : 'Menunggu Sesi Leader'}
            </p>

            {/* Countdown batas waktu */}
            {activeSessionInfo?.deadline && (
              <div className="mt-2 w-full">
                {countdown ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <Timer size={12} className="text-amber-500" />
                    <span className="text-[11px] font-semibold text-amber-600">
                      Tutup dalam {countdown.mins}m {countdown.secs}s
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 bg-red-50 rounded-lg px-2 py-1 mt-1">
                    <AlertTriangle size={12} className="text-red-500" />
                    <span className="text-[11px] font-semibold text-red-600">Batas waktu habis — status: Alpha</span>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                  Batas: {activeSessionInfo.deadline} · Toleransi: {activeSessionInfo.grace_period ?? 15} menit
                </p>
              </div>
            )}

            {activeSessionInfo && (
              <button
                onClick={() => handleCloseSession(activeSessionInfo.id)}
                disabled={closingSession}
                className="mt-4 w-full bg-red-50 text-red-600 border border-red-200 font-medium text-xs py-2.5 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                {closingSession ? 'Menutup...' : 'Tutup Sesi & Selesai'}
              </button>
            )}
          </div>

          {/* Preview status otomatis */}
          {activeSessionInfo?.deadline && (
            <div className={`mb-3 rounded-xl px-3 py-2 flex items-center gap-2 ${statusStyle[currentAutoStatus]?.badge || 'bg-gray-100'}`}>
              <div className={`w-2 h-2 rounded-full ${statusStyle[currentAutoStatus]?.dot}`} />
              <span className="text-xs font-medium">
                Jika absen sekarang → {statusLabel[currentAutoStatus]}
              </span>
            </div>
          )}

          {/* Input koordinat manual */}
          <div className="mb-4">
            <label className="text-[11px] font-medium text-gray-400 block mb-1">Koordinat Leader (Otomatis / Manual)</label>
            <input
              type="text"
              placeholder="Contoh: -7.8232, 112.0353"
              value={manualLeaderCoord || (activeSessionInfo ? `${activeSessionInfo.latitude}, ${activeSessionInfo.longitude}` : '')}
              onChange={(e) => setManualLeaderCoord(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black bg-white"
            />
          </div>

          <button
            onClick={handleEmployeeCheckIn}
            disabled={submitting || !activeSessionInfo}
            className={`w-full font-medium text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40
              ${isDeadlinePassed
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-black hover:bg-gray-800 text-white'
              }`}
          >
            <UserCheck size={14} />
            {submitting
              ? 'Memproses...'
              : isDeadlinePassed
              ? 'Absen (Tercatat Alpha)'
              : 'Absen Sekarang'}
          </button>
        </div>
      </div>

      {/* ==================== MODAL BUKA SESI LEADER ==================== */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-sm text-gray-800">Buka Sesi Absensi</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Atur lokasi, radius, dan batas waktu</p>
              </div>
              <button
                onClick={() => { setShowCreateSession(false); setSelectedTeamId('') }}
                className="text-gray-400 hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Pilih tim */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Pilih Tim</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
                >
                  <option value="">-- Pilih Tim --</option>
                  {myLedTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Batas waktu absen */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} /> Batas Waktu Absen (deadline)
                </label>
                <input
                  type="time"
                  value={sessionDeadline}
                  onChange={(e) => setSessionDeadline(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Anggota yang absen tepat waktu → Hadir. Lewat batas → Alpha otomatis.
                </p>
              </div>

              {/* Toleransi terlambat */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5 flex items-center gap-1.5">
                  <Timer size={13} /> Toleransi Terlambat
                </label>
                <div className="flex items-center gap-3">
                  {[5, 10, 15, 30].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSessionGracePeriod(m)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all
                        ${sessionGracePeriod === m
                          ? 'bg-black text-white border-black'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {m} mnt
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Contoh: batas 08:00, toleransi 15 mnt → lewat 08:15 baru Alpha.
                </p>
              </div>

              {/* Radius meter */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5 flex items-center gap-1.5">
                  <MapPin size={13} /> Radius Lokasi
                </label>
                <div className="flex items-center gap-3">
                  {[50, 100, 200, 500].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSessionRadiusMeter(r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all
                        ${sessionRadiusMeter === r
                          ? 'bg-black text-white border-black'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {r}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview ringkasan */}
              {selectedTeamId && sessionDeadline && (
                <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                  <p className="text-[11px] font-semibold text-amber-700 mb-1">Ringkasan Sesi</p>
                  <p className="text-[11px] text-amber-600">
                    · Batas absen: <strong>{sessionDeadline}</strong><br />
                    · Toleransi terlambat: <strong>{sessionGracePeriod} menit</strong> (s/d {
                      (() => {
                        const [h, m] = sessionDeadline.split(':').map(Number)
                        const total = h * 60 + m + sessionGracePeriod
                        return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
                      })()
                    })<br />
                    · Lewat batas → otomatis <strong>Alpha</strong><br />
                    · Radius: <strong>{sessionRadiusMeter} meter</strong>
                  </p>
                </div>
              )}

              <button
                onClick={handleLeaderSubmitSession}
                disabled={loadingLocation || !selectedTeamId || !sessionDeadline}
                className="w-full bg-black text-white font-medium text-xs py-3 rounded-xl transition-all hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Navigation size={13} />
                {loadingLocation ? 'Mengunci GPS...' : 'Kunci GPS & Aktifkan Sesi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Izin */}
      {showIzin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[380px] shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Ajukan Izin</h2>
              <button onClick={() => setShowIzin(false)} className="text-gray-400 hover:text-black">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Jenis Izin</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
                  value={izinForm.alasan}
                  onChange={(e) => setIzinForm({ ...izinForm, alasan: e.target.value })}
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
                  onChange={(e) => setIzinForm({ ...izinForm, keterangan: e.target.value })}
                />
              </div>
              <button
                onClick={handleSendIzin}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800"
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
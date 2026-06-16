import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import insightService from '../services/insightService'
import teamService from '../services/teamService'
import { Sparkles, Send } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Label & style per tipe insight
const insightStyle = {
  recommendation:    { label: 'Rekomendasi', bg: 'bg-black text-white' },
  summary:           { label: 'Ringkasan',   bg: 'bg-gray-700 text-white' },
  performance_score: { label: 'Performa',    bg: 'bg-gray-200 text-gray-700' },
}

/** Custom hook — pisahkan logika chat dari UI */
const useChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Halo! Saya AI Insight KelolaTeam. Tanya saya tentang performa tim, beban kerja, atau rekomendasi manajemen.' }
  ])
  const [loading, setLoading] = useState(false)

  // Simulasi AI response — ganti dengan API LLM jika BE sudah sediakan endpoint
  const dummyReplies = [
    'Berdasarkan data saat ini, pertimbangkan redistribusi tugas ke anggota dengan beban lebih rendah.',
    'Tingkat kehadiran tim perlu dievaluasi jika di bawah 85% selama 2 minggu berturut-turut.',
    'Anggota dengan 3+ tugas terlambat sebaiknya mendapat sesi 1-on-1 dengan leader.',
    'Tugas dengan prioritas urgent yang sudah lewat deadline perlu eskalasi ke admin.',
  ]

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    // TODO: ganti dengan API call ke BE ketika endpoint AI sudah siap
    // const res = await insightService.store({ content: text, type: 'summary', target_type: 'user', target_id: auth().id })
    await new Promise(r => setTimeout(r, 900))
    const reply = dummyReplies[Math.floor(Math.random() * dummyReplies.length)]
    setMessages(prev => [...prev, { role: 'ai', text: reply }])
    setLoading(false)
  }

  return { messages, loading, sendMessage }
}

export default function AIInsightPage() {
  const [insights, setInsights]   = useState([])
  const [teams, setTeams]         = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [loadingData, setLoadingData]   = useState(true)
  const [question, setQuestion]   = useState('')
  const { messages, loading, sendMessage } = useChat()
  const chatEndRef = useRef(null)

  useEffect(() => { fetchData() }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      const [insightRes, teamRes] = await Promise.all([
        insightService.getUserInsights(),
        teamService.getAll(),
      ])
      setInsights(insightRes.data ?? [])
      setTeams(teamRes.data ?? [])
    } catch {
      toast.error('Gagal memuat data insight')
    } finally {
      setLoadingData(false)
    }
  }

  const fetchTeamInsights = async (teamId) => {
    if (!teamId) return
    setSelectedTeam(teamId)
    try {
      const res = await insightService.getTeamInsights(teamId)
      setInsights(res.data ?? [])
    } catch {
      toast.error('Gagal memuat insight tim')
    }
  }

  const handleSend = () => {
    sendMessage(question)
    setQuestion('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">AI Insight</h1>
            <span className="text-xs bg-black text-white px-2.5 py-0.5 rounded-full">Beta</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Analisis otomatis & rekomendasi cerdas</p>
        </div>

        {/* Filter tim */}
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black bg-white"
          value={selectedTeam}
          onChange={e => e.target.value ? fetchTeamInsights(e.target.value) : fetchData()}
        >
          <option value="">Semua (Saya)</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Kolom Kiri */}
        <div className="col-span-2 flex flex-col gap-4">

          {/* Auto Summary dari BE */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-gray-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ringkasan & Rekomendasi</p>
            </div>

            {loadingData ? (
              <p className="text-xs text-gray-300 text-center py-6">Memuat insight...</p>
            ) : insights.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400">Belum ada insight tersedia.</p>
                <p className="text-xs text-gray-300 mt-1">Insight akan muncul setelah data tim & tugas terkumpul.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {insights.map(insight => {
                  const style = insightStyle[insight.type] ?? insightStyle.summary
                  return (
                    <div key={insight.id} className="bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${style.bg}`}>
                          {style.label}
                        </span>
                        {insight.score !== null && insight.score !== undefined && (
                          <span className={`text-sm font-bold
                            ${insight.score >= 80 ? 'text-emerald-600'
                              : insight.score >= 60 ? 'text-amber-600'
                              : 'text-red-500'}`}>
                            Skor: {insight.score}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{insight.content}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat AI */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Tanya AI</p>

            {/* Chat History */}
            <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Sparkles size={10} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-black text-white rounded-tr-sm'
                      : 'bg-gray-50 text-gray-700 rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      {[0, 150, 300].map(delay => (
                        <div key={delay} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-all"
                placeholder="Contoh: Siapa anggota paling produktif?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSend} disabled={loading || !question.trim()}
                className="bg-black text-white px-4 rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan — Skor Performa */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Skor Performa</p>

          {loadingData ? (
            <p className="text-xs text-gray-300 text-center py-6">Memuat...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Filter insight type performance_score */}
              {insights.filter(i => i.type === 'performance_score').length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-6">Belum ada skor performa</p>
              ) : (
                insights
                  .filter(i => i.type === 'performance_score')
                  .map(insight => (
                    <div key={insight.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 flex-1 line-clamp-2">{insight.content}</span>
                        {insight.score !== null && (
                          <span className={`text-lg font-bold ml-2 flex-shrink-0
                            ${insight.score >= 80 ? 'text-emerald-600'
                              : insight.score >= 60 ? 'text-amber-600'
                              : 'text-red-500'}`}>
                            {insight.score}
                          </span>
                        )}
                      </div>
                      {insight.score !== null && (
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${insight.score >= 80 ? 'bg-emerald-500' : insight.score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${insight.score}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))
              )}

              {/* Quick actions */}
              <div className="border-t border-gray-100 pt-3 mt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Quick Insight</p>
                {[
                  'Siapa paling produktif?',
                  'Tim mana paling sibuk?',
                  'Ada risiko keterlambatan?',
                ].map(q => (
                  <button key={q} onClick={() => { setQuestion(q); sendMessage(q) }}
                    className="w-full text-left text-xs text-gray-500 hover:text-black py-1.5 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                    → {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
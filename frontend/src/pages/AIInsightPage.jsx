import { useState } from 'react'
import Layout from '../components/Layout'
import { dummyAiInsights, dummyPerformance } from '../data/dummy'
import { Sparkles, Send } from 'lucide-react'

export default function AIInsightPage() {
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Halo! Saya AI Insight KelolaTeam. Tanya saya tentang performa tim, beban kerja, atau rekomendasi manajemen.' }
  ])
  const [loading, setLoading] = useState(false)

  // Simulasi AI response — nanti ganti dengan API call ke Laravel/OpenAI
  const dummyResponses = [
    'Berdasarkan data saat ini, Tim Alpha memiliki beban kerja paling tinggi (78%). Disarankan redistribusi tugas ke Tim Gamma yang baru 32%.',
    'Anggota paling produktif bulan ini adalah Sergius dengan skor 94, diikuti Akbar dengan skor 78.',
    'Tingkat kehadiran Tim Gamma (78%) berada di bawah target 85%. Evaluasi kebijakan absensi perlu dilakukan.',
    'Pradiza memiliki 3 tugas terlambat berturut-turut. Saran: adakan sesi 1-on-1 dengan leader tim.',
  ]

  const handleTanya = async () => {
    if (!question.trim()) return
    const userMsg = { role: 'user', text: question }
    setChatHistory(prev => [...prev, userMsg])
    setQuestion('')
    setLoading(true)

    // Simulasi delay API
    await new Promise(r => setTimeout(r, 1000))
    const aiResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)]
    setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }])
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTanya() }
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
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Kolom Kiri: Insight & Performa */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Auto Summary */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-gray-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ringkasan Otomatis</p>
            </div>
            <div className="flex flex-col gap-2">
              {dummyAiInsights.map(insight => (
                <div key={insight.id} className="bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                      {insight.type === 'recommendation' ? 'Rekomendasi' : insight.type === 'summary' ? 'Ringkasan' : 'Performa'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tanya AI */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Tanya AI</p>

            {/* Chat History */}
            <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Sparkles size={10} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user' ? 'bg-black text-white rounded-tr-sm' : 'bg-gray-50 text-gray-700 rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <div className="bg-gray-50 px-4 py-2.5 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
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
              <button
                onClick={handleTanya}
                disabled={loading}
                className="bg-black text-white px-4 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Skor Performa */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-4">Skor Performa</p>
          <div className="flex flex-col gap-4">
            {dummyPerformance.map((p, i) => (
              <div key={p.name} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${p.color}`}>{p.avatar}</div>
                  <span className="text-sm font-medium flex-1">{p.name}</span>
                  <span className={`text-lg font-bold ${p.score >= 80 ? 'text-emerald-600' : p.score >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                    {p.score}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full ${p.barColor}`} style={{ width: `${p.score}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Tugas: {p.tasks}</span>
                  <span>Hadir: {p.hadir}</span>
                </div>
                {p.note && (
                  <p className={`text-xs mt-1.5 font-medium ${p.score >= 80 ? 'text-emerald-600' : 'text-red-500'}`}>{p.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
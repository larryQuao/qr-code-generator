import { useState, useEffect } from 'react'
import Dashboard from './Dashboard'
import { getAll, saveEntry } from './storage'

function Generator({ onSaved }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleGenerate = async () => {
    setError('')
    setQrDataUrl(null)
    setSaved(false)

    if (!url.trim()) {
      setError('Please enter a URL.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate QR code.')
        return
      }

      setQrDataUrl(data.qrDataUrl)

      const entry = {
        id: crypto.randomUUID(),
        name: name.trim() || url.trim(),
        url: url.trim(),
        qrDataUrl: data.qrDataUrl,
        createdAt: new Date().toISOString(),
      }
      saveEntry(entry)
      setSaved(true)
      onSaved(entry)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `${(name.trim() || 'qrcode').replace(/\s+/g, '_')}.png`
    link.href = qrDataUrl
    link.click()
  }

  const handleReset = () => {
    setName('')
    setUrl('')
    setQrDataUrl(null)
    setError('')
    setSaved(false)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="space-y-4">
          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. My Portfolio"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* URL field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : 'Generate QR Code'}
          </button>
        </div>

        {/* Result */}
        {qrDataUrl && (
          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
            <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5">
              <img src={qrDataUrl} alt="Generated QR Code" className="w-52 h-52" />
            </div>

            {saved && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved to dashboard
              </div>
            )}

            <div className="w-full bg-gray-50 rounded-xl px-4 py-2.5">
              <p className="text-xs text-gray-500 truncate">{url}</p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-sm font-medium"
              >
                New
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Scan the QR code with any phone camera to open the link
      </p>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('generator')
  const [entries, setEntries] = useState([])

  useEffect(() => {
    setEntries(getAll())
  }, [])

  const handleSaved = entry => {
    setEntries(prev => [entry, ...prev])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4zm8-12h1m4 8h2M12 12h.01M8 12h.01M12 16h.01M16 12h.01" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">QR Generator</span>
          </div>

          {/* Nav tabs */}
          <nav className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('generator')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'generator'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === 'dashboard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
              {entries.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {entries.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {view === 'generator' ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
              <p className="text-gray-500 mt-1">Paste a URL and generate an instant QR code</p>
            </div>
            <Generator onSaved={handleSaved} />
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">All your saved QR codes</p>
            </div>
            <Dashboard entries={entries} setEntries={setEntries} />
          </>
        )}
      </main>
    </div>
  )
}

import { useState } from 'react'

export default function App() {
  const [url, setUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setError('')
    setQrDataUrl(null)

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
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrDataUrl
    link.click()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
          <p className="text-gray-500 mt-1">Paste a URL and generate an instant QR code</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
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

          {/* QR Result */}
          {qrDataUrl && (
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
              <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5">
                <img src={qrDataUrl} alt="Generated QR Code" className="w-52 h-52" />
              </div>

              <div className="w-full bg-gray-50 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 truncate">{url}</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PNG
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Scan the QR code with any phone camera to open the link
        </p>
      </div>
    </div>
  )
}

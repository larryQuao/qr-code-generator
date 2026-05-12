import { useState } from 'react'
import { removeEntry, updateName } from './storage'

function QRCard({ entry, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.name)

  const handleRename = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== entry.name) {
      updateName(entry.id, trimmed)
      onRename(entry.id, trimmed)
    }
    setEditing(false)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `${entry.name.replace(/\s+/g, '_')}.png`
    link.href = entry.qrDataUrl
    link.click()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* QR Image */}
      <div className="flex justify-center bg-gray-50 rounded-xl p-4">
        <img src={entry.qrDataUrl} alt={entry.name} className="w-36 h-36" />
      </div>

      {/* Name */}
      <div>
        {editing ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="flex-1 border border-indigo-400 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleRename}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
            <button
              onClick={() => { setDraft(entry.name); setEditing(true) }}
              className="shrink-0 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Rename"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
            </button>
          </div>
        )}
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-indigo-500 truncate block mt-0.5 transition-colors"
        >
          {entry.url}
        </a>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-400">
        {new Date(entry.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        })}
      </p>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={() => { removeEntry(entry.id); onDelete(entry.id) }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function Dashboard({ entries, setEntries }) {
  const handleDelete = id => setEntries(prev => prev.filter(e => e.id !== id))
  const handleRename = (id, name) =>
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, name } : e)))

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4zm8-12h1m4 8h2M12 12h.01M8 12h.01M12 16h.01M16 12h.01" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-700">No QR codes yet</p>
          <p className="text-sm text-gray-400 mt-1">Generate one and it will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{entries.length} QR code{entries.length !== 1 ? 's' : ''} saved</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {entries.map(entry => (
          <QRCard
            key={entry.id}
            entry={entry}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        ))}
      </div>
    </div>
  )
}

const KEY = 'qr_saved'

export function getAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveEntry(entry) {
  const all = getAll()
  localStorage.setItem(KEY, JSON.stringify([entry, ...all]))
}

export function removeEntry(id) {
  const all = getAll()
  localStorage.setItem(KEY, JSON.stringify(all.filter(e => e.id !== id)))
}

export function updateName(id, name) {
  const all = getAll()
  localStorage.setItem(
    KEY,
    JSON.stringify(all.map(e => (e.id === id ? { ...e, name } : e)))
  )
}

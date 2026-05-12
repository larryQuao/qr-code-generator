import QRCode from 'qrcode'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' })
  }

  try {
    new URL(url)
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Make sure it starts with https://' })
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })

    return res.status(200).json({ qrDataUrl })
  } catch {
    return res.status(500).json({ error: 'Failed to generate QR code.' })
  }
}

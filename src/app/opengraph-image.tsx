import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Master Oil Guinée — Huile Moteur Synthétique Super M7'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAFAF8',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gold bar top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: '#C8952A' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 72, lineHeight: 1 }}>🛢️</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <span style={{ fontSize: 56, fontWeight: 900, color: '#C8952A', letterSpacing: -2 }}>
                MASTER OIL
              </span>
              <span style={{ fontSize: 56, fontWeight: 900, color: '#111827', letterSpacing: -2 }}>
                GUINÉE
              </span>
            </div>
            <div style={{ width: 80, height: 4, background: '#C8952A', borderRadius: 2 }} />
            <p style={{ fontSize: 24, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
              Distributeur exclusif Super M7 en Guinée
            </p>
            <p style={{ fontSize: 18, color: '#9CA3AF', textAlign: 'center' }}>
              Huile moteur 100% synthétique canadienne · Conakry
            </p>
          </div>
        </div>

        {/* Gold bar bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: '#C8952A' }} />
      </div>
    ),
    { ...size }
  )
}

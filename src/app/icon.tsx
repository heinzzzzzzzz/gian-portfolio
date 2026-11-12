import { ImageResponse } from 'next/og'

export const dynamic = "force-static";

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 17,
          background: '#474329',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F0E5D8',
          fontWeight: 800,
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          letterSpacing: '-1px',
        }}
      >
        GB
      </div>
    ),
    { ...size }
  )
}

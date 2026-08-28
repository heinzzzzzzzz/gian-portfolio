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
          fontSize: 18,
          background: 'linear-gradient(to bottom right, #2DD4BF, #22D3EE)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#06070A',
          fontWeight: 800,
          borderRadius: '8px',
          fontFamily: 'sans-serif',
        }}
      >
        GB
      </div>
    ),
    { ...size }
  )
}

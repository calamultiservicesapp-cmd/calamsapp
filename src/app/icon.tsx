import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a', // slate-900
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '100px',
        }}
      >
        <div
          style={{
            fontSize: 160,
            fontWeight: 800,
            color: '#f97316', // orange-500
            letterSpacing: '-2px',
          }}
        >
          CALA
        </div>
      </div>
    ),
    { ...size }
  );
}

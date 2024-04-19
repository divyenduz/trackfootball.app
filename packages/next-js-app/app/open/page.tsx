'use client'

import React, { useRef, useState } from 'react'

export default function Open() {
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState('3000px')
  return (
    <div className="w-full max-w-4xl">
      <iframe
        ref={ref}
        onLoad={() => {
          if (ref.current) {
            setHeight(
              ref.current.contentWindow?.document.body.scrollHeight + 'px'
            )
          }
        }}
        src="https://metabase.zoid.dev/public/dashboard/fcf41055-6590-483a-8930-1251ad44dab6"
        width={'100%'}
        height={height}
        style={{
          overflow: 'auto',
        }}
      ></iframe>
    </div>
  )
}

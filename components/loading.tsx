'use client'
import { CSSProperties, useState } from 'react'
import PacmanLoader from 'react-spinners/PacmanLoader'

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'black',
}

export default function Loading() {
  let [loading, setLoading] = useState(true)
  let [color, setColor] = useState('#ffffff')

  return (
    <div className="sweet-loading">
      <button onClick={() => setLoading(!loading)}>Toggle Loader</button>
      <input
        value={color}
        onChange={(input) => setColor(input.target.value)}
        placeholder="Color of the loader"
      />

      <PacmanLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  )
}

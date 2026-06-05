import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen grid place-items-center bg-slate-900 text-slate-50 font-sans">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Hello, World! 👋</h1>
        <p className="mb-6 text-slate-300">
          Welcome to practice-chaos — a tiny React app on GitHub Pages.
        </p>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
        >
          Clicked {count} time{count === 1 ? '' : 's'}
        </button>
      </div>
    </main>
  )
}

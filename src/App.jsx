import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { techniques } from './data/techniques'
import { escalations } from './data/escalations'
import { verdicts } from './data/verdicts'

function pickUnused(list, used) {
  const remaining = list.filter((item) => !used.includes(item))
  if (remaining.length === 0) return null
  return remaining[Math.floor(Math.random() * remaining.length)]
}

const CHAOS_THRESHOLD = 3

let nextId = 0
const makeEntry = (technique) => ({
  id: ++nextId,
  technique,
  escalation: null,
})

function StackItem({ entry }) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (!entry.escalation || !scope.current) return
    animate(
      scope.current,
      {
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        color: ['#1e293b', '#dc2626', '#dc2626', '#dc2626', '#1e293b'],
      },
      { duration: 0.6, ease: 'easeInOut' }
    )
  }, [entry.escalation, animate, scope])

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="text-base"
    >
      <motion.span ref={scope} className="inline-block align-top">
        {entry.technique}
        <AnimatePresence>
          {entry.escalation && (
            <motion.span
              key={entry.escalation}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {' '}
              {entry.escalation}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.li>
  )
}

export default function App() {
  const [piece, setPiece] = useState('')
  const [stack, setStack] = useState([])
  const [usedTechniques, setUsedTechniques] = useState([])
  const [usedEscalations, setUsedEscalations] = useState([])
  const [usedVerdicts, setUsedVerdicts] = useState([])
  const [verdict, setVerdict] = useState(null)
  const [roundId, setRoundId] = useState(0)

  // Roll a fresh verdict, avoiding repeats within the session.
  // Resets the pool if every verdict has already been seen.
  const rollVerdict = () => {
    let pool = usedVerdicts
    let next = pickUnused(verdicts, pool)
    if (!next) {
      pool = []
      next = pickUnused(verdicts, pool)
    }
    setUsedVerdicts([...pool, next])
    setVerdict(next)
  }

  const spinRoulette = () => {
    const choice = pickUnused(techniques, [])
    setStack([makeEntry(choice)])
    setUsedTechniques([choice])
    setUsedEscalations([])
    setUsedVerdicts([])
    setVerdict(null)
    setRoundId((r) => r + 1)
  }

  const spinAgainWorse = () => {
    if (stack.length === 0) return
    const tail = pickUnused(escalations, usedEscalations)
    if (!tail) return

    const unescalatedIndices = stack
      .map((entry, i) => (entry.escalation ? null : i))
      .filter((i) => i !== null)
    if (unescalatedIndices.length === 0) return

    const targetIndex =
      unescalatedIndices[Math.floor(Math.random() * unescalatedIndices.length)]

    setUsedEscalations((prev) => [...prev, tail])
    setStack((prev) =>
      prev.map((entry, i) =>
        i === targetIndex ? { ...entry, escalation: tail } : entry
      )
    )
    if (stack.length >= CHAOS_THRESHOLD) rollVerdict()
  }

  const stackAnother = () => {
    const choice = pickUnused(techniques, usedTechniques)
    if (!choice) return
    setUsedTechniques((prev) => [...prev, choice])
    setStack((prev) => [...prev, makeEntry(choice)])
    if (stack.length + 1 >= CHAOS_THRESHOLD) rollVerdict()
  }

  const noMoreTechniques = usedTechniques.length >= techniques.length
  const allEscalated = stack.every((entry) => entry.escalation)
  const noMoreEscalations =
    usedEscalations.length >= escalations.length || allEscalated

  const resetChaos = () => {
    setStack([])
    setUsedTechniques([])
    setUsedEscalations([])
    setUsedVerdicts([])
    setVerdict(null)
    setRoundId((r) => r + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl shadow-xl bg-white">
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-bold text-center text-slate-900">
            Practice Chaos 🎵
          </h1>

          <input
            className="w-full p-2 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="What piece are you practicing?"
            value={piece}
            onChange={(e) => setPiece(e.target.value)}
          />

          <button
            className="w-full px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={spinRoulette}
          >
            Spin for Chaos 🎲
          </button>

          {stack.length > 0 && (
            <div className="flex gap-2">
              <button
                className="w-full px-4 py-2 rounded-xl bg-slate-200 text-slate-900 font-medium hover:bg-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-200"
                onClick={spinAgainWorse}
                disabled={noMoreEscalations}
                title={noMoreEscalations ? 'This is as bad as it gets!' : ''}
              >
                Make it Worse 😈
              </button>
              <button
                className="w-full px-4 py-2 rounded-xl bg-slate-200 text-slate-900 font-medium hover:bg-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-200"
                onClick={stackAnother}
                disabled={noMoreTechniques}
                title={noMoreTechniques ? 'Really?' : ''}
              >
                Add Another 🎯
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {stack.length > 0 && (
              <motion.div
                key={roundId}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-4 p-4 bg-gray-100 rounded-xl space-y-2"
              >
                <p className="text-lg font-semibold text-slate-900">
                  {piece ? `For "${piece}"...` : 'Your challenge...'}
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-800">
                  <AnimatePresence initial={false}>
                    {stack.map((entry) => (
                      <StackItem key={entry.id} entry={entry} />
                    ))}
                  </AnimatePresence>
                </ul>
                <AnimatePresence mode="wait">
                  {verdict && (
                    <motion.p
                      key={verdict}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="text-sm text-red-500 font-medium"
                    >
                      🚨 {verdict}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {verdict && (
            <button
              className="w-full px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
              onClick={resetChaos}
            >
              I Regret Everything 🙏
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


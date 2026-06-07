import { useReducer, useState } from 'react'
import { techniques } from './data/techniques'
import { escalations } from './data/escalations'
import { verdicts } from './data/verdicts'

function pickUnused(list, used) {
  const remaining = list.filter((item) => !used.includes(item))
  if (remaining.length === 0) return null
  return remaining[Math.floor(Math.random() * remaining.length)]
}

const CHAOS_THRESHOLD = 3

const makeEntry = (technique) => ({
  id: crypto.randomUUID(),
  technique,
  escalation: null
})

const initialState = {
  stack: [],
  usedTechniques: [],
  usedEscalations: [],
  usedVerdicts: [],
  verdict: null,
  roundId: 0
}

// Roll a fresh verdict, avoiding repeats within the round.
// Resets the pool if every verdict has already been seen.
function rollVerdict(usedVerdicts) {
  let pool = usedVerdicts
  let next = pickUnused(verdicts, pool)
  if (!next) {
    pool = []
    next = pickUnused(verdicts, pool)
  }
  return { verdict: next, usedVerdicts: [...pool, next] }
}

function withVerdictIfChaotic(state, nextStackLength) {
  if (nextStackLength < CHAOS_THRESHOLD) return state
  return { ...state, ...rollVerdict(state.usedVerdicts) }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SPIN': {
      const choice = pickUnused(techniques, [])
      if (!choice) return state
      return {
        ...initialState,
        stack: [makeEntry(choice)],
        usedTechniques: [choice],
        roundId: state.roundId + 1
      }
    }
    case 'ESCALATE': {
      if (state.stack.length === 0) return state
      const tail = pickUnused(escalations, state.usedEscalations)
      if (!tail) return state

      const unescalatedIndices = state.stack
        .map((entry, i) => (entry.escalation ? null : i))
        .filter((i) => i !== null)
      if (unescalatedIndices.length === 0) return state

      const targetIndex =
        unescalatedIndices[
          Math.floor(Math.random() * unescalatedIndices.length)
        ]

      const nextStack = state.stack.map((entry, i) =>
        i === targetIndex ? { ...entry, escalation: tail } : entry
      )
      const next = {
        ...state,
        stack: nextStack,
        usedEscalations: [...state.usedEscalations, tail]
      }
      return withVerdictIfChaotic(next, nextStack.length)
    }
    case 'ADD_ANOTHER': {
      const choice = pickUnused(techniques, state.usedTechniques)
      if (!choice) return state
      const nextStack = [...state.stack, makeEntry(choice)]
      const next = {
        ...state,
        stack: nextStack,
        usedTechniques: [...state.usedTechniques, choice]
      }
      return withVerdictIfChaotic(next, nextStack.length)
    }
    case 'RESET':
      return { ...initialState, roundId: state.roundId + 1 }
    default:
      return state
  }
}

function StackItem({ entry }) {
  // Keying the inner span on `entry.escalation` re-mounts it when an
  // escalation appears, which lets the CSS shake animation play once.
  return (
    <li className="text-base pc-stack-item">
      <span
        key={entry.escalation ?? 'idle'}
        className={`inline-block align-top ${entry.escalation ? 'pc-shake' : ''}`}
      >
        {entry.technique}
        {entry.escalation && (
          <span className="pc-escalation"> {entry.escalation}</span>
        )}
      </span>
    </li>
  )
}

function ActionButtons({ onWorse, onAdd, worseDisabled, addDisabled }) {
  return (
    <div className="flex gap-2">
      <button
        className="w-full px-4 py-2 rounded-xl bg-slate-200 text-slate-900 font-medium hover:bg-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:disabled:hover:bg-slate-700"
        onClick={onWorse}
        disabled={worseDisabled}
        title={worseDisabled ? 'This is as bad as it gets!' : ''}
      >
        Make it Worse 😈
      </button>
      <button
        className="w-full px-4 py-2 rounded-xl bg-slate-200 text-slate-900 font-medium hover:bg-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:disabled:hover:bg-slate-700"
        onClick={onAdd}
        disabled={addDisabled}
        title={addDisabled ? 'Really?' : ''}
      >
        Add Another 🎯
      </button>
    </div>
  )
}

function ResultCard({ piece, stack, verdict, roundId }) {
  return (
    <div
      key={roundId}
      className="mt-4 p-4 bg-slate-50 ring-1 ring-slate-200/70 rounded-xl space-y-2 pc-result-card dark:bg-slate-800/70 dark:ring-slate-700"
    >
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {piece ? `For "${piece}"...` : 'Your challenge...'}
      </p>
      <ul className="list-disc pl-5 space-y-1 text-slate-800 dark:text-slate-200">
        {stack.map((entry) => (
          <StackItem key={entry.id} entry={entry} />
        ))}
      </ul>
      {verdict && (
        <p
          key={verdict}
          className="text-sm text-rose-600 font-medium pc-verdict dark:text-red-400"
        >
          🚨 {verdict}
        </p>
      )}
    </div>
  )
}

export default function App() {
  const [piece, setPiece] = useState('')
  const [state, dispatch] = useReducer(reducer, initialState)
  const { stack, usedTechniques, usedEscalations, verdict, roundId } = state

  const noMoreTechniques = usedTechniques.length >= techniques.length
  const allEscalated = stack.every((entry) => entry.escalation)
  const noMoreEscalations =
    usedEscalations.length >= escalations.length || allEscalated

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-500 via-pink-500 to-red-500 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl shadow-purple-900/10 ring-1 ring-black/5 dark:bg-slate-900 dark:shadow-purple-950/40 dark:ring-slate-800">
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">
            Practice Chaos 🎵
          </h1>

          <input
            className="w-full p-2 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-purple-500"
            placeholder="What piece are you practicing?"
            value={piece}
            onChange={(e) => setPiece(e.target.value)}
          />

          <button
            className="w-full px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer dark:bg-purple-600 dark:hover:bg-purple-500"
            onClick={() => dispatch({ type: 'SPIN' })}
          >
            Spin for Chaos 🎲
          </button>

          {stack.length > 0 && (
            <ActionButtons
              onWorse={() => dispatch({ type: 'ESCALATE' })}
              onAdd={() => dispatch({ type: 'ADD_ANOTHER' })}
              worseDisabled={noMoreEscalations}
              addDisabled={noMoreTechniques}
            />
          )}

          {stack.length > 0 && (
            <ResultCard
              piece={piece}
              stack={stack}
              verdict={verdict}
              roundId={roundId}
            />
          )}

          {verdict && (
            <button
              className="w-full px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer dark:bg-red-700 dark:hover:bg-red-600"
              onClick={() => dispatch({ type: 'RESET' })}
            >
              I Regret Everything 🙏
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

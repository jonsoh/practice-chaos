import { useState } from 'react'
import Button from './components/Button'
import ActionButtons from './components/ActionButtons'
import ResultCard from './components/ResultCard'
import { useChaos } from './hooks/useChaos'

export default function App() {
  const [piece, setPiece] = useState('')
  const {
    stack,
    verdict,
    roundId,
    noMoreTechniques,
    noMoreEscalations,
    spin,
    escalate,
    addAnother,
    reset
  } = useChaos()

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-500 via-pink-500 to-red-500 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl shadow-purple-900/10 ring-1 ring-black/5 dark:bg-slate-900 dark:shadow-purple-950/40 dark:ring-slate-800">
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">
            Practice Chaos 🎵
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              spin()
            }}
            className="space-y-4"
          >
            <label htmlFor="piece" className="sr-only">
              What piece are you practicing?
            </label>
            <input
              id="piece"
              autoFocus
              className="w-full p-2 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-purple-500"
              placeholder="What piece are you practicing?"
              value={piece}
              onChange={(e) => setPiece(e.target.value)}
            />

            <Button variant="primary" type="submit">
              Spin for Chaos 🎲
            </Button>
          </form>

          {stack.length > 0 && (
            <>
              <ActionButtons
                onWorse={escalate}
                onAdd={addAnother}
                worseDisabled={noMoreEscalations}
                addDisabled={noMoreTechniques}
              />
              <ResultCard
                piece={piece}
                stack={stack}
                verdict={verdict}
                roundId={roundId}
              />
            </>
          )}

          {verdict && (
            <Button variant="danger" onClick={reset}>
              I Regret Everything 🙏
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

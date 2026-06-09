import { useReducer } from 'react'
import { escalations } from '../data/escalations'
import { techniques } from '../data/techniques'
import { verdicts } from '../data/verdicts'

const CHAOS_THRESHOLD = 3

const initialState = {
  stack: [],
  usedTechniques: [],
  usedEscalations: [],
  usedVerdicts: [],
  verdict: null,
  roundId: 0
}

function pickUnused(list, used) {
  const remaining = list.filter((item) => !used.includes(item))
  if (remaining.length === 0) return null
  return remaining[Math.floor(Math.random() * remaining.length)]
}

const makeEntry = (technique) => ({
  id: crypto.randomUUID(),
  technique,
  escalation: null
})

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

      const unescalatedIndices = state.stack.flatMap((entry, i) =>
        entry.escalation ? [] : [i]
      )
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

export function useChaos() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { stack, usedTechniques, usedEscalations, verdict, roundId } = state

  const allEscalated = stack.every((entry) => entry.escalation)
  const noMoreTechniques = usedTechniques.length >= techniques.length
  const noMoreEscalations =
    usedEscalations.length >= escalations.length || allEscalated

  return {
    stack,
    verdict,
    roundId,
    noMoreTechniques,
    noMoreEscalations,
    spin: () => dispatch({ type: 'SPIN' }),
    escalate: () => dispatch({ type: 'ESCALATE' }),
    addAnother: () => dispatch({ type: 'ADD_ANOTHER' }),
    reset: () => dispatch({ type: 'RESET' })
  }
}

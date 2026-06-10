function StackItem({ entry }) {
  return (
    <li className="text-base animate-slide-in motion-reduce:animate-none">
      <span
        key={entry.escalation ?? 'idle'}
        className={`inline-block align-top ${
          entry.escalation ? 'animate-shake motion-reduce:animate-none' : ''
        }`}
      >
        {entry.technique}
        {entry.escalation && (
          <span className="animate-fade-in motion-reduce:animate-none">
            {' '}
            {entry.escalation}
          </span>
        )}
      </span>
    </li>
  )
}

export default function ResultCard({ piece, stack, verdict, roundId }) {
  const trimmedPiece = piece.trim()
  return (
    <div
      key={roundId}
      className="mt-4 p-4 bg-slate-50 ring-1 ring-slate-200/70 rounded-xl space-y-2 animate-card-in motion-reduce:animate-none dark:bg-slate-800/70 dark:ring-slate-700"
    >
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {trimmedPiece ? `For "${trimmedPiece}"...` : 'Your challenge...'}
      </p>
      <ul className="list-disc pl-5 space-y-1 text-slate-800 dark:text-slate-200">
        {stack.map((entry) => (
          <StackItem key={entry.id} entry={entry} />
        ))}
      </ul>
      {verdict && (
        <p
          key={verdict}
          className="text-sm text-rose-600 font-medium animate-verdict-in motion-reduce:animate-none dark:text-red-400"
        >
          🚨 {verdict}
        </p>
      )}
    </div>
  )
}

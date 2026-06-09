import Button from './Button'

export default function ActionButtons({
  onWorse,
  onAdd,
  worseDisabled,
  addDisabled
}) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onWorse}
        disabled={worseDisabled}
        title={worseDisabled ? 'This is as bad as it gets!' : ''}
      >
        Make it Worse 😈
      </Button>
      <Button
        onClick={onAdd}
        disabled={addDisabled}
        title={addDisabled ? 'Really?' : ''}
      >
        Add Another 🎯
      </Button>
    </div>
  )
}

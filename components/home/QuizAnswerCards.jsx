export default function QuizAnswerCards({ questions }) {
  if (!questions?.length) {
    return (
      <div className="my-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
        Today&apos;s quiz answers are temporarily unavailable. Please check back
        shortly.
      </div>
    )
  }

  return (
    <div className="space-y-3 my-6">
      {questions.map((q, i) => (
        <div
          key={i}
          className="border border-border rounded-lg overflow-hidden shadow-sm"
        >
          <div className="bg-primary px-4 py-3 flex items-center gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent text-center text-xs font-bold leading-none text-white">
              {i + 1}
            </span>
            <p className="text-white font-semibold text-sm leading-snug">
              {q.question}
            </p>
          </div>

          {q.options.length > 0 && (
            <div className="bg-surface px-4 py-3 flex flex-wrap gap-2 border-b border-border">
              {q.options.map((opt, j) => {
                const correct =
                  opt.toLowerCase().trim() === q.answer.toLowerCase().trim()

                return (
                  <span
                    key={j}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      correct
                        ? 'bg-green-50 border-green-500 text-green-800 font-bold'
                        : 'bg-white border-border text-text-secondary'
                    }`}
                  >
                    {opt}
                  </span>
                )
              })}
            </div>
          )}

          <div className="bg-green-50 px-4 py-2 flex items-center gap-2">
            <span className="text-green-800 font-bold text-sm">Answer:</span>
            <span className="text-green-800 font-bold text-sm">{q.answer}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

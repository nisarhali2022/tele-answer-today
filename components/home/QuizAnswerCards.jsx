import { Fragment } from 'react'
import AdImage from '@/components/ads/AdImage'
import { hasAdAfterQuestion } from '@/lib/utils'

// A 300x250 image ad after questions 1 and 3 (then 5, 7, ...), never after the
// last one. Padded and labelled so it can't be mistaken for an answer option.
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
    <div className="space-y-4 my-6">
      {questions.map((q, i) => (
        <Fragment key={i}>
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="bg-primary px-4 py-3">
            <p className="text-sm font-bold leading-snug text-white">
              Question {i + 1}
            </p>
          </div>

          <div className="space-y-3 bg-white p-4">
            <div className="rounded-md border border-border bg-white px-3 py-3">
              <p className="text-[15px] font-semibold leading-relaxed text-text-primary">
                {q.question}
              </p>
            </div>

            {q.options.length > 0 && (
              <>
                <p className="text-sm font-bold uppercase tracking-wide text-text-primary">
                  Options
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {q.options.map((opt, j) => {
                    const correct =
                      opt.toLowerCase().trim() === q.answer.toLowerCase().trim()

                    return (
                      <div
                        key={j}
                        className={`flex min-w-0 items-start gap-2 rounded-md border px-3 py-2 text-[15px] leading-relaxed ${
                          correct
                            ? 'border-green-500 bg-green-50 font-semibold text-green-800'
                            : 'border-border bg-white text-text-secondary'
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold leading-none ${
                            correct
                              ? 'border-green-500 bg-green-600 text-white'
                              : 'border-border bg-surface text-text-secondary'
                          }`}
                        >
                          {correct ? '\u2713' : String.fromCharCode(65 + j)}
                        </span>
                        <span className="min-w-0 break-words">{opt}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2">
              <span className="text-sm font-bold text-green-800">Answer:</span>
              <span className="text-sm font-bold text-green-800">{q.answer}</span>
            </div>
          </div>
        </div>
        {hasAdAfterQuestion(i, questions.length) ? (
          <AdImage className="py-4" />
        ) : null}
        </Fragment>
      ))}
    </div>
  )
}

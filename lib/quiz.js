const MAX_QUESTION_LENGTH = 300
const MAX_OPTION_LENGTH = 150

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function normalizeQuizQuestions(questions) {
  if (!Array.isArray(questions) || questions.length !== 5) {
    throw new Error('Quiz must have exactly 5 questions.')
  }

  return questions.map((item, index) => {
    const question =
      typeof item?.question === 'string' ? item.question.trim() : ''
    const answer =
      typeof item?.answer === 'string' ? item.answer.trim() : ''
    const options = Array.isArray(item?.options)
      ? item.options.map((option) =>
          typeof option === 'string' ? option.trim() : ''
        )
      : []

    if (!question || question.length > MAX_QUESTION_LENGTH) {
      throw new Error(
        `Question ${index + 1} must contain 1-${MAX_QUESTION_LENGTH} characters.`
      )
    }

    if (
      options.length !== 4 ||
      options.some(
        (option) => !option || option.length > MAX_OPTION_LENGTH
      )
    ) {
      throw new Error(
        `Question ${index + 1} must have 4 non-empty options of at most ${MAX_OPTION_LENGTH} characters.`
      )
    }

    const matchingOption = options.find(
      (option) => option.toLowerCase() === answer.toLowerCase()
    )

    if (!matchingOption) {
      throw new Error(
        `Question ${index + 1} answer must match one of its options.`
      )
    }

    return {
      question,
      options,
      answer: matchingOption,
    }
  })
}

export function formatQuizContent(questions) {
  return questions
    .map((question, index) => {
      const options = question.options
        .map((option) => `<tr><td>- ${escapeHtml(option)}</td></tr>`)
        .join('')

      return (
        `<table><tbody><tr><td>Question ${index + 1}: ` +
        `${escapeHtml(question.question)}</td></tr>${options}` +
        `<tr><td>Answer -> ${escapeHtml(question.answer)}</td></tr>` +
        '</tbody></table>'
      )
    })
    .join('')
}

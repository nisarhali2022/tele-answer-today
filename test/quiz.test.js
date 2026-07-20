import test from 'node:test'
import assert from 'node:assert/strict'
import {
  escapeHtml,
  formatQuizContent,
  normalizeQuizQuestions,
} from '../lib/quiz.js'
import { parseFaqs, parseQuizTables } from '../lib/quizParser.js'

function makeQuestions() {
  return Array.from({ length: 5 }, (_, index) => ({
    question: ` Question ${index + 1}? `,
    options: [' One ', 'Two', 'Three', 'Four'],
    answer: 'one',
  }))
}

test('normalizeQuizQuestions trims values and restores option casing', () => {
  const questions = normalizeQuizQuestions(makeQuestions())

  assert.equal(questions.length, 5)
  assert.equal(questions[0].question, 'Question 1?')
  assert.deepEqual(questions[0].options, ['One', 'Two', 'Three', 'Four'])
  assert.equal(questions[0].answer, 'One')
})

test('normalizeQuizQuestions rejects an answer outside the options', () => {
  const questions = makeQuestions()
  questions[2].answer = 'Five'

  assert.throws(
    () => normalizeQuizQuestions(questions),
    /answer must match one of its options/
  )
})

test('quiz HTML escapes admin-controlled text', () => {
  const questions = normalizeQuizQuestions(makeQuestions())
  questions[0].question = '<script>alert("x")</script>'
  questions[0].options[0] = 'A & B'
  questions[0].answer = 'A & B'

  const html = formatQuizContent(questions)

  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/)
  assert.match(html, /A &amp; B/)
  assert.equal(escapeHtml(`'"<&>`), '&#39;&quot;&lt;&amp;&gt;')
})

test('parseQuizTables handles table questions without a question mark', () => {
  const html = `
    <table><tbody>
      <tr><td>Question 1: Pakistan capital</td></tr>
      <tr><td>- Karachi</td></tr>
      <tr><td>- Lahore</td></tr>
      <tr><td>- Islamabad</td></tr>
      <tr><td>- Peshawar</td></tr>
      <tr><td>Answer -> Islamabad</td></tr>
    </tbody></table>
  `

  assert.deepEqual(parseQuizTables(html), [
    {
      question: 'Pakistan capital',
      options: ['Karachi', 'Lahore', 'Islamabad', 'Peshawar'],
      answer: 'Islamabad',
    },
  ])
})

test('parseQuizTables handles numbered legacy table format', () => {
  const html = `
    <h2>Today Telenor Answer</h2>
    <p>1. Which app has the quiz</p>
    <p>My Telenor App</p>
    <p>WhatsApp</p>
    <p>Facebook</p>
    <p>Maps</p>
    <p>Answer: My Telenor App</p>
    <p>2. Which network is this for</p>
    <p>Telenor</p>
    <p>Jazz</p>
    <p>Zong</p>
    <p>Ufone</p>
    <p>Answer: Telenor</p>
  `

  assert.deepEqual(parseQuizTables(html), [
    {
      question: 'Which app has the quiz',
      options: ['My Telenor App', 'WhatsApp', 'Facebook', 'Maps'],
      answer: 'My Telenor App',
    },
    {
      question: 'Which network is this for',
      options: ['Telenor', 'Jazz', 'Zong', 'Ufone'],
      answer: 'Telenor',
    },
  ])
})

test('parseFaqs reads only the real homepage FAQ section', () => {
  const html = `
    <h2>How to Play the Telenor Quiz Today and Win Free MBs?</h2>
    <p>This question-style heading is normal content and should not be a FAQ.</p>
    <h2>FAQs - My Telenor Answers Today</h2>
    <h3>Q: What is the today my Telenor question and answer 2026?</h3>
    <p>Today my telenor answer 2026 provide the latest daily quiz solutions.</p>
    <h3>Q: How many MBs can I win from the telenor quiz today?</h3>
    <p>Today Telenor quiz answers correctly and get up to 150MB free internet daily.</p>
  `

  assert.deepEqual(parseFaqs(html), [
    {
      q: 'What is the today my Telenor question and answer 2026?',
      a: 'Today my telenor answer 2026 provide the latest daily quiz solutions.',
    },
    {
      q: 'How many MBs can I win from the telenor quiz today?',
      a: 'Today Telenor quiz answers correctly and get up to 150MB free internet daily.',
    },
  ])
})

test('parseFaqs caps homepage FAQs to six items', () => {
  const questions = Array.from(
    { length: 7 },
    (_, index) => `<h3>Q: Question ${index + 1}?</h3><p>Answer ${index + 1}</p>`
  ).join('')

  const faqs = parseFaqs(`<h2>FAQs - My Telenor Answers Today</h2>${questions}`)

  assert.equal(faqs.length, 6)
  assert.equal(faqs[5].q, 'Question 6?')
})

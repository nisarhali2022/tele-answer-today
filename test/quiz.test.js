import test from 'node:test'
import assert from 'node:assert/strict'
import {
  escapeHtml,
  formatQuizContent,
  normalizeQuizQuestions,
} from '../lib/quiz.js'
import { parseQuizTables } from '../lib/quizParser.js'

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

test('parseQuizTables handles numbered WordPress page format', () => {
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

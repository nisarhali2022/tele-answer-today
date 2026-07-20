export const FALLBACK_HOME_FAQS = [
  {
    q: 'What is today my Telenor question answer?',
    a: 'Today My Telenor question answer means the latest daily quiz question and correct option shown in the My Telenor App. It helps users submit the quiz confidently and claim the reward shown in their account.',
  },
  {
    q: 'How many MBs can I win from the Telenor quiz today?',
    a: 'Many Telenor quiz today rewards are around 150 MB, but the exact reward can vary by SIM, campaign, and account eligibility. Always confirm the final reward inside the My Telenor App.',
  },
  {
    q: 'How often are Telenor quiz answers today updated?',
    a: 'Telenor Quiz Today usually refreshes every day. We track the My Telenor App quiz and update the website so users can check today Telenor quiz answers before submitting their attempt.',
  },
  {
    q: 'Can non-Telenor users take part in the quiz?',
    a: 'Telenor Daily Quiz is made for active Telenor SIM users. You need a working Telenor number to participate through the My Telenor App and receive rewards.',
  },
  {
    q: 'How many times can I play the Telenor quiz per day?',
    a: 'You can usually play the Telenor Daily Quiz once per day. The quiz refreshes daily, allowing you to attempt new questions and check the latest Telenor answer today.',
  },
  {
    q: 'What is the Telenor question today?',
    a: 'The Telenor question today appears inside the My Telenor App daily quiz. Open Test Your Skills or Play & Win to view the question, compare the options, and choose the correct answer.',
  },
  {
    q: 'Where can I find my Telenor app answer today?',
    a: 'You can find my Telenor app answer today on this homepage and inside the My Telenor App quiz section. Match the exact question text before submitting your answer.',
  },
]

export function getVisibleHomeFaqs(faqs) {
  const validFaqs = (faqs || []).filter((faq) => faq?.q?.trim() && faq?.a?.trim())
  const source = validFaqs.length >= 6 ? validFaqs : FALLBACK_HOME_FAQS

  return source
    .slice(0, 6)
}

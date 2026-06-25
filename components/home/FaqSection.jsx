import { homeAnchorId } from '@/lib/homeAnchors';

const FAQS = [
  {
    q: 'What is the today my Telenor question and answer 2026?',
    a: 'Today My Telenor answer 2026 provides the latest daily quiz solutions to help users win free MBs, SMS, and call minutes instantly.',
  },
  {
    q: 'How many MBs can I win from the Telenor quiz today?',
    a: 'Answer the Today Telenor quiz correctly and get up to 150MB free internet daily.',
  },
  {
    q: 'How often are Telenor quiz answers today updated?',
    a: 'Telenor Quiz Today updates daily at midnight. We track the My Telenor App quiz today in real time and update our website within minutes, so you always get the latest correct Telenor quiz answers.',
  },
  {
    q: 'Can non-Telenor users take part in the quiz?',
    a: 'Telenor Daily Quiz works exclusively for Telenor SIM users. You must use an active Telenor number to participate through the MyTelenor app.',
  },
  {
    q: 'How many times can I play the Telenor quiz per day?',
    a: 'You can play the Telenor Daily Quiz once every day. The quiz resets at midnight, allowing you to attempt new questions and win rewards the next day.',
  },
  {
    q: 'What is the Telenor question today?',
    a: 'Today Telenor question appears inside the MyTelenor app daily quiz, where users open the app to check the My Telenor question today, submit the correct answer, and earn instant rewards.',
  },
  {
    q: 'Where can I find today Telenor question answer?',
    a: 'Find today Telenor questions and answers directly in the My Telenor app under the Quiz, Test Your Skills, or Play & Win sections.',
  },
];

export default function FaqSection({ faqs }) {
  // Use parsed FAQs if available, otherwise fall back to hardcoded.
  const items = (faqs?.length ? faqs : FAQS).slice(0, 6);

  return (
    <section id={homeAnchorId('FAQs - My Telenor Answers Today')} className="my-8">
      <h2 className="font-heading font-bold text-xl text-text-primary mb-5">
        FAQs - My Telenor Answers Today
      </h2>
      <div className="space-y-4">
        {items.map((faq, i) => (
          <div key={i} className="border border-border rounded-lg bg-surface px-4 py-3">
            <p className="font-semibold text-sm text-text-primary">
              Q: {faq.q}
            </p>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              A: {faq.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: 'What is the today my Telenor question and answer 2026?',
    a: 'Today My Telenor Answer 2026 provides the latest daily quiz challenges. Users can submit correct answers to earn free MBs, SMS, and call minutes instantly.',
  },
  {
    q: 'How many MBs can I win from the Telenor quiz today?',
    a: 'Answer the Telenor quiz today correctly to win up to 150 MB of free internet every day. The reward system makes it easy to enjoy extra data while participating in a fun quiz.',
  },
  {
    q: 'How often do Telenor quiz answers update?',
    a: 'Telenor quiz answers update every day at midnight. Our website tracks the MyTelenor App quiz in real time and publishes the latest correct answers within minutes.',
  },
  {
    q: 'Can non-Telenor users participate in the quiz?',
    a: 'The Telenor Daily Quiz only works for active Telenor SIM users. Prepaid and postpaid numbers both qualify. Dual-SIM phone users can play using their Telenor SIM even if another network is primary.',
  },
  {
    q: 'How many times can I play the Telenor quiz each day?',
    a: 'Each Telenor SIM allows one quiz attempt per day. The quiz resets at midnight, giving users a fresh set of questions and rewards every day.',
  },
  {
    q: 'Where can I find today Telenor question answer?',
    a: 'You can find today Telenor question answers directly in the My Telenor App under sections like Quiz, Test Your Skills, or Play & Win. Users also check here to confirm the correct answer before submitting.',
  },
];

export default function FaqSection({ faqs }) {
  // Use parsed FAQs if available, otherwise fall back to hardcoded
  const items = faqs?.length ? faqs : FAQS;

  return (
    <section id="faqs" className="my-8">
      <h2 className="font-heading font-bold text-xl text-text-primary mb-5">
        FAQs – My Telenor Answers Today
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

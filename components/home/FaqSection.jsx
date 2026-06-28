import { homeAnchorId } from '@/lib/homeAnchors';
import { getVisibleHomeFaqs } from '@/lib/homeFaqs';

export default function FaqSection({ faqs }) {
  const items = getVisibleHomeFaqs(faqs);

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

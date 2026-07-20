import { Suspense } from 'react';
import Link from 'next/link';
import { getCurrentQuiz, getHomeTemplate, getPosts } from '@/lib/cms';
import { EXCLUDED_CONTENT_SLUGS, SITE_CONFIG } from '@/lib/constants';
import { getKarachiDateLabel, getKarachiSeoDateLabel, getKarachiSeoDayStartISO } from '@/lib/date';
import { buildMetadata } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/schema';
import { homeAnchorId } from '@/lib/homeAnchors';

import Sidebar from '@/components/layout/Sidebar';
import AdBanner from '@/components/ads/AdBanner';
import AdInArticle from '@/components/ads/AdInArticle';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TableOfContents from '@/components/posts/TableOfContents';

import QuizAnswerCards from '@/components/home/QuizAnswerCards';
import LatestNewsGrid from '@/components/home/LatestNewsGrid';
import StepsSection from '@/components/home/StepsSection';
import FaqSection from '@/components/home/FaqSection';
import { getVisibleHomeFaqs } from '@/lib/homeFaqs';
import QuizInfoSections from '@/components/home/QuizInfoSections';

export const revalidate = 3600;

function tocItem(text, level) {
  return { id: homeAnchorId(text), text, level };
}

function buildHomeToc(todayLabel) {
  return [
    tocItem(`Telenor Quiz Today ${todayLabel} - Latest Telenor Answer today`, 1),
    tocItem('Quick Summary: My Telenor Answer Today', 2),
    tocItem(`Today Telenor Answer ${todayLabel}`, 2),
    tocItem("Today Telenor Quiz Questions and Answers - Quick Guide", 2),
    tocItem('Latest News', 2),
    tocItem('What is the Telenor Daily Quiz?', 2),
    tocItem('Today Telenor Quiz Categories', 2),
    tocItem('How to Find the Correct My Telenor Quiz Answers Today Quickly?', 2),
    tocItem('How to Play the Telenor Quiz Today and Win Free MBs?', 2),
    tocItem('Can You Play the My Telenor Quiz on PC?', 2),
    tocItem('How to Get Verified Telenor Quiz Today Answer Before It Expires?', 2),
    tocItem('Why Do People Love the Daily Telenor Quiz So Much?', 2),
    tocItem('Who Can Participate in the Today Telenor Quiz Answer?', 2),
    tocItem('Eligibility Details', 3),
    tocItem('Key Participation Rules', 3),
    tocItem('Rewards', 3),
    tocItem('What You Get from My Telenor Today Answers?', 2),
    tocItem('How Can You Always Get Accurate Today Telenor Quiz?', 2),
    tocItem('What If Your My Telenor Question Is Different?', 2),
    tocItem('What is the Fastest Way to Get Accurate Answers Using Modern AI?', 2),
    tocItem('Quick AI Solution Method', 3),
    tocItem("What to Do If the Telenor Quiz Isn't Working", 2),
    tocItem('Quiz Not Loading?', 3),
    tocItem('App Keeps Crashing?', 3),
    tocItem("Didn't Receive Free MBs?", 3),
    tocItem('Discover the Educational Benefits', 2),
    tocItem('Tips to Maximize Your Success', 2),
    tocItem('Tips for a Seamless Telenor Quiz Experience:', 2),
    tocItem('Keep Your App Updated', 3),
    tocItem('Check Your Device Storage and Software', 3),
    tocItem('Use Stable Internet', 3),
    tocItem('Report Persistent Issues', 3),
    tocItem('Enjoy a Hassle-Free Quiz', 3),
    tocItem('Why You Should Play the Telenor Quiz Every Day', 2),
    tocItem('Earn Free Daily Internet', 3),
    tocItem('Sharpen Your Knowledge', 3),
    tocItem('Learn on the Go', 3),
    tocItem('Fast and Fun', 3),
    tocItem('How Telenor Maintains Quiz Fairness', 2),
    tocItem('The Future of Today My Telenor Answer', 2),
    tocItem('Conclusion', 2),
    tocItem('Steps to Participate', 2),
    tocItem('Install the My Telenor App', 3),
    tocItem('Log In with Your Telenor SIM', 3),
    tocItem('Navigate to the "Play & Win" Section', 3),
    tocItem('Answer 5 Quiz Questions', 3),
    tocItem('Claim Your Reward', 3),
    tocItem('FAQs - My Telenor Answers Today', 2),
  ];
}

async function optionalHomeData(promise, context, fallback) {
  try {
    return await promise;
  } catch (error) {
    console.error(context, error);
    return fallback;
  }
}

export async function generateMetadata() {
  const page = await optionalHomeData(
    getHomeTemplate(),
    'Unable to fetch CMS homepage metadata source',
    null
  );
  const seoDateLabel = getKarachiSeoDateLabel();

  const title = `Telenor Quiz Today ${seoDateLabel} - Latest Telenor Answer Today`;
  const description = `Telenor Quiz Today ${seoDateLabel} Get all correct answers. Check daily updated questions and My Telenor answers today to boost your score and win rewards.`;
  const ogImage =
    page?.ogImage?.url ||
    `${SITE_CONFIG.siteUrl}${SITE_CONFIG.defaultOgImage}`;

  return buildMetadata({
    title,
    description,
    path: '/',
    image: ogImage,
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const [quiz, homepageTemplate, newsData] = await Promise.all([
    optionalHomeData(getCurrentQuiz(), 'Unable to fetch CMS global quiz', null),
    optionalHomeData(getHomeTemplate(), 'Unable to fetch CMS homepage template', null),
    optionalHomeData(
      getPosts({ page: 1, perPage: 60, excludeSlugs: EXCLUDED_CONTENT_SLUGS, tag: 'news' }),
      'Unable to fetch homepage news posts',
      { posts: [] }
    ),
  ]);

  const newsPosts = newsData?.posts || [];
  const quizQuestions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const faqs = Array.isArray(homepageTemplate?.contentData?.faqs)
    ? homepageTemplate.contentData.faqs.map((faq) => ({
        q: faq?.q || faq?.question || '',
        a: faq?.a || faq?.answer || '',
      }))
    : [];
  const visibleFaqs = getVisibleHomeFaqs(faqs);

  const todayLabel = getKarachiDateLabel();
  const h1Text = `Telenor Quiz Today ${todayLabel} - Latest Telenor Answer today`;
  const quizHeading = `Today Telenor Answer ${todayLabel}`;
  const homeToc = buildHomeToc(todayLabel);
  const seoDateLabel = getKarachiSeoDateLabel();
  const seoDateModified = getKarachiSeoDayStartISO();
  const homepageDescription = `Telenor Quiz Today ${seoDateLabel} Get all correct answers. Check daily updated questions and My Telenor answers today to boost your score and win rewards.`;
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_CONFIG.siteUrl}/#homepage`,
    name: `Telenor Quiz Today ${seoDateLabel} - Latest Telenor Answer Today`,
    description: homepageDescription,
    url: SITE_CONFIG.siteUrl,
    isPartOf: { '@id': `${SITE_CONFIG.siteUrl}/#website` },
    dateModified: seoDateModified,
  };
  const faqSchema =
    visibleFaqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: visibleFaqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          })),
        }
      : null;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homepageSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">

          {/* Main Content */}
          <article className="min-w-0">
            {/* Title */}
      
            <h1
              id={homeAnchorId(h1Text)}
              className="font-heading font-bold text-2xl sm:text-3xl text-text-primary leading-tight mb-4"
            >
              {h1Text}</h1>

            {/* Intro */}
            <div className="text-text-secondary leading-relaxed space-y-3 mb-6">
              <p>
                <strong>
                  <Link href="/" className="text-accent font-bold underline decoration-2">My Telenor Answer Today</Link>
                </strong>{' '}
                helps users find the today My Telenor question answer, correct options, and reward guidance in one place. The daily quiz inside the My Telenor App gives you the opportunity to win free internet MBs, balance, and bonus rewards. By answering a few simple questions correctly, you can enjoy free connectivity while improving your knowledge at the same time.
              </p>
              <p>
                <Link href="/" className="text-accent font-bold underline decoration-2">Telenor Quiz Today</Link>{' '}
                is designed for everyone, whether you are a student who wants extra MBs for study, a freelancer who relies on mobile data, or an everyday user looking for bonus rewards. It takes only a few seconds to participate, and the questions are engaging and easy to attempt.
              </p>
              <p>
                We update the today Telenor 5 question answer regularly so you do not miss your daily chance to win. Even if you use a dual SIM phone with another primary number like{' '}
                <a href="https://jazz.com.pk/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold underline decoration-2">Jazz</a>,{' '}
                <a href="https://www.zong.com.pk/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold underline decoration-2">Zong</a>, or{' '}
                <a href="https://www.ufone.com/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold underline decoration-2">Ufone</a>{' '}
                you can still participate with your Telenor SIM in the secondary slot. This makes the quiz convenient and accessible for almost everyone.
              </p>
            </div>

            <section
              id={homeAnchorId('Quick Summary: My Telenor Answer Today')}
              className="my-6 rounded-lg border border-primary/15 bg-primary/5 px-4 py-4"
            >
              <h2 className="mb-3 font-heading text-xl font-bold text-text-primary">
                Quick Summary: My Telenor Answer Today
              </h2>
              <div className="space-y-2 leading-relaxed text-text-secondary">
                <p>
                  My Telenor Answer Today gives you the latest daily quiz help for the My Telenor App, including the today My Telenor answer, question details, correct option guidance, and reward information.
                </p>
                <p>
                  If you searched for Telenor answer today, today Telenor quiz answers, or my Telenor app answer today, use the quiz cards below first, then read the guide sections for playing, troubleshooting, and understanding possible rewards.
                </p>
              </div>
            </section>

            <TableOfContents toc={homeToc} />

            {/* Top Ad */}
            <AdBanner position="top" />

            {/* Quiz Answers */}
            <section className="my-6" id={homeAnchorId(quizHeading)}>
              <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
                {quizHeading}
              </h2>
              <QuizAnswerCards questions={quizQuestions} />
            </section>

            <section
              id={homeAnchorId("Today Telenor Quiz Questions and Answers - Quick Guide")}
              className="my-6"
            >
              <h2 className="mb-4 font-heading text-xl font-bold text-text-primary">
                Today Telenor Quiz Questions and Answers - Quick Guide
              </h2>
              <div className="space-y-3 leading-relaxed text-text-secondary">
                <p>
                  Today Telenor quiz questions and answers help you check the five daily questions before submitting your attempt in the My Telenor App. Read each question carefully, match it with the correct option, and submit only when you are confident.
                </p>
                <p>
                  The most common searches, including today My Telenor question answer, Telenor question today, and Telenor quiz today answer, all have the same user goal: finding the correct answer quickly without wasting the daily attempt.
                </p>
                <p>
                  Rewards can vary by account, SIM type, location, or campaign. The quiz commonly offers free MBs, but the final reward shown inside the app should always be treated as the official result.
                </p>
              </div>
            </section>

            {/* In-Article Ad */}
            <AdInArticle />

            {/* Latest News */}
            <LatestNewsGrid posts={newsPosts} />

            {/* Static info sections */}
            <QuizInfoSections />

            {/* Steps */}
            <StepsSection />

            {/* Mid Ad */}
            <AdBanner position="mid" />

            {/* FAQs */}
            <FaqSection faqs={visibleFaqs} />

            {/* Bottom Ad */}
            <AdBanner position="bottom" />
          </article>

          {/* Sidebar */}
          <Suspense fallback={<LoadingSpinner size="lg" className="py-10" />}>
            <Sidebar />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import Link from 'next/link';
import { getDailyQuizPost, getHomepageQuizPage, getPosts } from '@/lib/wordpress';
import { EXCLUDED_CONTENT_SLUGS, SITE_CONFIG } from '@/lib/constants';
import { getKarachiDateLabel, getKarachiSeoDateLabel, getKarachiSeoDayStartISO } from '@/lib/date';
import { buildMetadata } from '@/lib/seo';
import { parseQuizTables, parseFaqs } from '@/lib/quizParser';
import { serializeJsonLd } from '@/lib/schema';

import Sidebar from '@/components/layout/Sidebar';
import AdBanner from '@/components/ads/AdBanner';
import AdInArticle from '@/components/ads/AdInArticle';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TableOfContents from '@/components/posts/TableOfContents';

import QuizAnswerCards from '@/components/home/QuizAnswerCards';
import LatestNewsGrid from '@/components/home/LatestNewsGrid';
import StepsSection from '@/components/home/StepsSection';
import FaqSection from '@/components/home/FaqSection';
import QuizInfoSections from '@/components/home/QuizInfoSections';

export const revalidate = 3600;

const HOME_TOC = [
  { id: 'article-title', text: 'Telenor Quiz Today', level: 1 },
  { id: 'quiz-answers', text: 'Today Telenor Answer', level: 2 },
  { id: 'latest-news', text: 'Latest News', level: 2 },
  { id: 'what-is-telenor-daily-quiz', text: 'What is the Telenor Daily Quiz?', level: 2 },
  { id: 'find-correct-answers', text: 'How to Find Correct Answers Quickly', level: 2 },
  { id: 'how-to-play', text: 'How to Play and Win Free MBs', level: 2 },
  { id: 'verified-answer', text: 'Get Verified Answers Before Expiry', level: 2 },
  { id: 'why-people-love-it', text: 'Why People Love the Daily Quiz', level: 2 },
  { id: 'who-can-join', text: 'Who Can Join', level: 2 },
  { id: 'what-you-get', text: 'What You Get', level: 2 },
  { id: 'accurate-quiz', text: 'Always Get Accurate Answers', level: 2 },
  { id: 'ai-answer-method', text: 'Fastest AI Answer Method', level: 2 },
  { id: 'quiz-not-working', text: 'What To Do If Quiz Is Not Working', level: 2 },
  { id: 'educational-benefits', text: 'Educational Benefits', level: 2 },
  { id: 'tips', text: 'Tips to Maximize Success', level: 2 },
  { id: 'seamless-experience', text: 'Seamless Quiz Experience', level: 2 },
  { id: 'play-every-day', text: 'Why Play Every Day', level: 2 },
  { id: 'fairness', text: 'Quiz Fairness', level: 2 },
  { id: 'future', text: 'Future of Today My Telenor Answer', level: 2 },
  { id: 'conclusion', text: 'Conclusion', level: 2 },
  { id: 'steps-to-participate', text: 'Steps to Participate', level: 2 },
  { id: 'faqs', text: 'FAQs', level: 2 },
];

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
    getHomepageQuizPage(),
    'Unable to fetch homepage metadata source',
    null
  );
  const seoDateLabel = getKarachiSeoDateLabel();

  const title = `Telenor Quiz Today ${seoDateLabel} - Latest My Telenor Answer Today`;
  const description = `Telenor Quiz Today ${seoDateLabel} Get all correct answers. Check daily updated questions and My Telenor answers today to boost your score and win rewards.`;
  const ogImage =
    page?._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
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
  const [quizPage, homepagePage, newsData] = await Promise.all([
    optionalHomeData(getDailyQuizPost(), 'Unable to fetch daily quiz post', null),
    optionalHomeData(getHomepageQuizPage(), 'Unable to fetch homepage content page', null),
    optionalHomeData(
      getPosts({ page: 1, perPage: 12, excludeSlugs: EXCLUDED_CONTENT_SLUGS, tag: 'news' }),
      'Unable to fetch homepage news posts',
      { posts: [] }
    ),
  ]);

  const newsPosts = newsData?.posts || [];
  const quizContent = quizPage?.content?.rendered || '';
  const homepageContent = homepagePage?.content?.rendered || '';
  const quizQuestions = parseQuizTables(quizContent);
  const faqs = parseFaqs(homepageContent);

  const todayLabel = getKarachiDateLabel();
  const seoDateLabel = getKarachiSeoDateLabel();
  const seoDateModified = getKarachiSeoDayStartISO();
  const homepageDescription = `Telenor Quiz Today ${seoDateLabel} Get all correct answers. Check daily updated questions and My Telenor answers today to boost your score and win rewards.`;
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_CONFIG.siteUrl}/#homepage`,
    name: `Telenor Quiz Today ${seoDateLabel} - Latest My Telenor Answer Today`,
    description: homepageDescription,
    url: SITE_CONFIG.siteUrl,
    isPartOf: { '@id': `${SITE_CONFIG.siteUrl}/#website` },
    dateModified: seoDateModified,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homepageSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">

          {/* Main Content */}
          <article className="min-w-0">
            {/* Title */}
      
            <h1
              id="article-title"
              className="font-heading font-bold text-2xl sm:text-3xl text-text-primary leading-tight mb-4"
            >
              My Telenor Answer Today {todayLabel} - Latest Telenor Quiz Today</h1>

            {/* Intro */}
            <div className="text-text-secondary text-sm sm:text-base leading-relaxed space-y-3 mb-6">
              <p>
                <strong>
                  <Link href="/" className="text-accent font-bold underline decoration-2">My Telenor Answer Today</Link>
                </strong>{' '}
                is a daily feature inside the Today My Telenor App Question Answer that gives you the opportunity to win free internet MBs, balance, and exciting bonus rewards. By answering a few simple questions correctly, you can enjoy free connectivity while boosting your knowledge at the same time.
              </p>
              <p>
                <Link href="/" className="text-accent font-bold underline decoration-2">Telenor quiz today</Link>{' '}
                is designed for everyone, whether you are a student who wants extra MBs for study, a freelancer who relies on mobile data, or an everyday user looking for bonus rewards. It takes only a few seconds to participate, and the questions are both engaging and easy to attempt.
              </p>
              <p>
                We update the Today Telenor 5 question answer regularly so you do not miss your daily chance to win. Even if you use a dual SIM phone with another primary number like{' '}
                <a href="https://jazz.com.pk/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold underline decoration-2">Jazz</a>,{' '}
                <a href="https://www.zong.com.pk/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold underline decoration-2">Zong</a>, or{' '}
                <a href="https://www.ufone.com/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold underline decoration-2">Ufone</a>{' '}
                you can still participate with your Telenor SIM in the secondary slot. This makes the quiz convenient and accessible for almost everyone.
              </p>
            </div>

            <TableOfContents toc={HOME_TOC} />

            {/* Top Ad */}
            <AdBanner position="top" />

            {/* Quiz Answers */}
            <section className="my-6" id="quiz-answers">
              <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
                Today Telenor Answer {todayLabel}
              </h2>
              <QuizAnswerCards questions={quizQuestions} />
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
            <FaqSection faqs={faqs} />

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

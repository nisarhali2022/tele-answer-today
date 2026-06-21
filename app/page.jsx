import { Suspense } from 'react';
import Link from 'next/link';
import { getHomepageQuizPage, getPosts } from '@/lib/wordpress';
import { EXCLUDED_CONTENT_SLUGS, SITE_CONFIG } from '@/lib/constants';
import { getKarachiDateLabel } from '@/lib/date';
import { buildMetadata } from '@/lib/seo';
import { parseQuizTables, parseFaqs } from '@/lib/quizParser';

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
  { id: 'find-correct-answers', text: 'How to Find Correct Answers', level: 2 },
  { id: 'how-to-play', text: 'How to Play and Win Free MBs', level: 2 },
  { id: 'why-people-love-it', text: 'Why People Love the Daily Quiz', level: 2 },
  { id: 'who-can-join', text: 'Who Can Join', level: 2 },
  { id: 'rewards', text: 'Rewards You Can Get', level: 2 },
  { id: 'common-problems', text: 'Common Problems and Fixes', level: 2 },
  { id: 'tips', text: 'Tips to Boost Your Success', level: 2 },
  { id: 'conclusion', text: 'Conclusion', level: 2 },
  { id: 'steps-to-participate', text: 'Steps to Participate', level: 2 },
  { id: 'faqs', text: 'FAQs', level: 2 },
];

export async function generateMetadata() {
  const page = await getHomepageQuizPage();
  const yoast = page?.yoast_head_json;
  const todayLabel = getKarachiDateLabel();

  const title = `Telenor Quiz Today ${todayLabel} - Latest My Telenor Answers`;
  const description =
    yoast?.description ||
    SITE_CONFIG.description;
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
  const [quizPage, newsData] = await Promise.all([
    getHomepageQuizPage(),
    getPosts({ page: 1, perPage: 12, excludeSlugs: EXCLUDED_CONTENT_SLUGS, tag: 'news' }),
  ]);

  const newsPosts = newsData?.posts || [];
  const homepageContent = quizPage?.content?.rendered || '';
  const quizQuestions = parseQuizTables(homepageContent);
  const faqs = parseFaqs(homepageContent);

  const todayLabel = getKarachiDateLabel();

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">

          {/* ── Main Content ── */}
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
                  <Link href="/" className="text-accent hover:underline">Telenor quiz today</Link>
                </strong>{' '}
              is a popular daily feature inside the My Telenor app. Tele Answer Today helps Telenor users find the latest quiz answers, win free internet MBs, and avoid missing daily rewards.
              </p>
              <p>
                Tele Answer Today suits every type of user. Students can grab extra data for online classes, freelancers can stay connected for work, and regular users can collect daily rewards without any hassle. The quiz takes only a few seconds, and the questions stay easy, relevant, and engaging.
              </p>
              <p>
                We update the today Telenor 5 question answer every day so you never miss a winning chance. Even if you use a dual SIM phone with{' '}
                <a href="https://jazz.com.pk/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">Jazz</a>,{' '}
                <a href="https://www.zong.com.pk/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">Zong</a>, or{' '}
                <a href="https://www.ufone.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">Ufone</a>{' '}
                as your main number, you can still participate using your Telenor SIM in the second slot.
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

          {/* ── Sidebar ── */}
          <Suspense fallback={<LoadingSpinner size="lg" className="py-10" />}>
            <Sidebar />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

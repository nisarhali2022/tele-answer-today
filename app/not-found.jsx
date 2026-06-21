import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6">
        <span className="font-heading font-black text-8xl sm:text-9xl text-primary/10 select-none">
          404
        </span>
      </div>

      <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary mb-3">
        Page Not Found
      </h1>

      <p className="text-text-secondary max-w-md mb-8 text-sm sm:text-base">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved. Try searching for what you need or go back to the homepage.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link
          href="/"
          className="px-6 py-3 bg-accent text-white rounded font-semibold hover:bg-accent-dark transition-colors text-sm"
        >
          ← Back to Homepage
        </Link>
        <Link
          href="/search"
          className="px-6 py-3 border border-accent text-accent rounded font-semibold hover:bg-accent/5 transition-colors text-sm"
        >
          Search Posts
        </Link>
      </div>

      <p className="mt-10 text-xs text-text-secondary">
        {SITE_CONFIG.siteName} — {SITE_CONFIG.tagline}
      </p>
    </div>
  );
}

import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/wordpress'
import {
  toPlainText,
  truncateText,
} from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/constants'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export const revalidate = 3600

export async function generateMetadata() {
  const page = await getPageBySlug('contact-us')
  const title = page?.title?.rendered
    ? toPlainText(page.title.rendered)
    : 'Contact Us'
  const description = page?.excerpt?.rendered
    ? truncateText(page.excerpt.rendered, 160)
    : `Contact the ${SITE_CONFIG.name} team.`

  return buildMetadata({ title, description, path: '/contact-us' })
}

export default async function ContactPage() {
  const page = await getPageBySlug('contact-us')
  if (!page) notFound()
  const pageTitle = toPlainText(page.title?.rendered) || 'Contact Us'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]}
        currentPath="/contact-us"
      />
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
            Contact
          </p>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary">
            {pageTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
            Have a question, correction, or suggestion? Send us a message and
            our team will review it as soon as possible.
          </p>

          <form
            action="mailto:info@teleanswertoday.pk"
            method="post"
            encType="text/plain"
            className="mt-8 space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text-primary">
                  Name
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text-primary">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Subject
              </span>
              <input
                type="text"
                name="subject"
                required
                className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="How can we help?"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Message
              </span>
              <textarea
                name="message"
                rows={6}
                required
                className="w-full resize-y rounded-lg border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Write your message..."
              />
            </label>
            <button type="submit" className="btn-primary rounded-lg">
              Send Message
            </button>
          </form>
        </article>

        <aside className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">
            Contact Details
          </h2>
          <div className="mt-5 space-y-4 text-sm text-text-secondary">
            <div>
              <p className="font-semibold text-text-primary">Email</p>
              <a
                href="mailto:info@teleanswertoday.pk"
                className="text-accent hover:underline"
              >
                info@teleanswertoday.pk
              </a>
            </div>
            <div>
              <p className="font-semibold text-text-primary">Contact Page</p>
              <a href="/contact-us" className="text-accent hover:underline">
                https://teleanswertoday.pk/contact-us
              </a>
            </div>
            <p className="leading-relaxed">
              This website is independently operated and is not affiliated with
              Telenor Pakistan.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

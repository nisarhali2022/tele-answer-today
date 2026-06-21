import Link from 'next/link'
import Image from 'next/image'
import { SITE_CONFIG } from '@/lib/constants'

const menuLinks = [
  { label: 'Home', href: '/' },
  { label: 'Telecom', href: '/telecom' },
  { label: 'Global', href: '/global' },
  { label: 'Telenor', href: '/telenor' },
  { label: 'Blog', href: '/blog' },
]

const moreLinks = [
  { label: 'About us', href: '/about-us' },
  { label: 'Contact us', href: '/contact-us' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Disclaimer', href: '/disclaimer' },
]

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/people/Telenor-Answer-Today/61581271963855',
    icon: (
      <path d="M13.5 8.5H16V5h-2.9C9.8 5 8 6.8 8 10v2H5v3.5h3V24h4v-8.5h3.2l.6-3.5H12v-1.7c0-1 .3-1.8 1.5-1.8Z" />
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/tele-answer-today/',
    icon: (
      <>
        <path d="M6.5 9.5h4V24h-4V9.5Z" />
        <path d="M8.5 8a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" />
        <path d="M13 9.5h3.8v2c.6-1.1 1.9-2.3 4-2.3 4.2 0 5 2.8 5 6.4V24h-4v-7.4c0-1.8 0-4-2.5-4s-2.8 1.9-2.8 3.8V24H13V9.5Z" />
      </>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@teleanswertoday',
    icon: (
      <>
        <path d="M23.5 7.3a3 3 0 0 0-2.1-2.1C19.5 4.7 12 4.7 12 4.7s-7.5 0-9.4.5A3 3 0 0 0 .5 7.3 31 31 0 0 0 0 13a31 31 0 0 0 .5 5.7 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 13a31 31 0 0 0-.5-5.7Z" />
        <path className="fill-navy" d="M9.6 16.6V9.4l6.3 3.6-6.3 3.6Z" />
      </>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://x.com/TeleA48105',
    icon: (
      <path d="M17.5 4h3.7l-8 9.2L22.7 24h-7.4l-5.8-6.9L2.9 24H-.8l8.6-9.8L-1.3 4h7.6l5.2 6 6-6Zm-1.3 18h2L5.2 5.9H3.1L16.2 22Z" />
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/teleanswertoday.pk',
    icon: (
      <>
        <path d="M12 7.8A6.2 6.2 0 1 0 12 20a6.2 6.2 0 0 0 0-12.2Zm0 10a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6Z" />
        <path d="M20.3 7.5a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z" />
        <path d="M17.4 24H6.6A6.6 6.6 0 0 1 0 17.4V6.6A6.6 6.6 0 0 1 6.6 0h10.8A6.6 6.6 0 0 1 24 6.6v10.8a6.6 6.6 0 0 1-6.6 6.6ZM6.6 2.4a4.2 4.2 0 0 0-4.2 4.2v10.8a4.2 4.2 0 0 0 4.2 4.2h10.8a4.2 4.2 0 0 0 4.2-4.2V6.6a4.2 4.2 0 0 0-4.2-4.2H6.6Z" />
      </>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@telenoranswertoday',
    icon: (
      <path d="M17.3 2.1c.4 2.5 1.8 4 4.2 4.2v3.4c-1.5.1-2.9-.3-4.1-1.1v6.2c0 5.5-6 8.9-10.7 6-3.1-1.9-4.2-6-2.5-9.2 1.4-2.7 4.4-4.2 7.4-3.5v3.6c-.5-.2-1-.3-1.6-.2-1.8.2-3.2 1.7-3.1 3.5.1 2.5 2.9 3.9 4.9 2.4.9-.7 1.4-1.8 1.4-2.9V2.1h4.1Z" />
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://www.pinterest.com/answertele/',
    icon: (
      <path d="M12.3 0C5.6 0 2 4.3 2 9c0 2.2 1.2 5 3.1 5.9.3.1.5.1.6-.2l.5-2c.1-.3 0-.4-.2-.7-.6-.7-1-1.7-1-3C5 5.7 7.5 2.6 12 2.6c3.8 0 6.4 2.2 6.4 5.8 0 4.1-2.1 7-4.8 7-1.5 0-2.7-1.3-2.3-2.8.4-1.8 1.3-3.8 1.3-5.1 0-1.2-.6-2.2-2-2.2-1.6 0-2.9 1.7-2.9 3.9 0 1.4.5 2.4.5 2.4l-2 8.3c-.4 1.8 0 4.3.1 4.5.1.1.2.1.3 0 .1-.1 1.8-2.2 2.3-4l1.1-4.1c.6 1.1 2.2 2 3.9 2 5.1 0 8.8-4.7 8.8-10.5C22.6 3.2 18.8 0 12.3 0Z" />
    ),
  },
]

function FooterHeading({ children }) {
  return (
    <h3 className="text-white font-heading font-bold text-lg mb-5 border-l-4 border-accent pl-3">
      {children}
    </h3>
  )
}

function FooterLinkList({ links }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-gray-300 hover:text-accent text-sm transition-colors flex items-center gap-2"
          >
            <span className="text-accent font-bold">›</span>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function SocialLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          aria-label={link.label}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-colors hover:bg-accent hover:text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-current"
            aria-hidden="true"
          >
            {link.icon}
          </svg>
        </a>
      ))}
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="block mb-4">
              <Image
                src={SITE_CONFIG.logoUrl}
                alt={SITE_CONFIG.name}
                width={180}
                height={40}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <FooterHeading>About us</FooterHeading>
            <p className="text-gray-300 text-sm leading-relaxed">
              We offer accurate and reliable information to help users in
              Pakistan earn free internet and rewards. This platform is
              independently operated and is not associated with Telenor
              Pakistan. All content is created to guide users and enhance their
              Telenor quiz experience.
            </p>
          </div>

          <div>
            <FooterHeading>Menu</FooterHeading>
            <FooterLinkList links={menuLinks} />
          </div>

          <div>
            <FooterHeading>More Link</FooterHeading>
            <FooterLinkList links={moreLinks} />
          </div>

          <div>
            <FooterHeading>Disclaimer</FooterHeading>
            <p className="text-gray-300 text-sm leading-relaxed">
              This website is an independent platform that provides general
              quiz-related information and tips for the My Telenor App. We are
              not affiliated with, authorized by, or endorsed by Telenor
              Pakistan. All content is shared for informational purposes only,
              and users are advised to confirm details through official Telenor
              sources.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p className="text-gray-400">
            © {year} {SITE_CONFIG.name}. All rights reserved.
          </p>

          <SocialLinks />
        </div>
      </div>
    </footer>
  )
}

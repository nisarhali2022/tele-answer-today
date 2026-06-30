import Link from 'next/link'
import Image from 'next/image'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'
import HeaderControls from './HeaderControls'

export default function Header() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 w-full bg-white shadow-sm">
        <div className="hidden bg-primary px-4 py-1.5 text-center text-xs text-white md:block">
          Get Today&apos;s Telenor Quiz Answers Daily - Win 150 MB Free Internet
          Every Day!
        </div>

        <header className="relative w-full border-b border-border bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-16 min-w-0 items-center justify-between gap-3">
              <Link href="/" className="min-w-0 flex-shrink">
                <Image
                  src={SITE_CONFIG.logoUrl}
                  alt={SITE_CONFIG.name}
                  width={240}
                  height={55}
                  className="h-auto w-[180px] sm:w-[250px] object-contain"
                  priority
                />
              </Link>

              <nav className="hidden items-center gap-0.5 xl:flex">
                {NAV_LINKS.map((link) => (
                  <div key={link.href} className="group relative">
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 whitespace-nowrap rounded px-3 py-2 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-primary-light hover:text-primary group-focus-within:bg-primary-light group-focus-within:text-primary"
                      aria-haspopup={link.children?.length ? 'true' : undefined}
                    >
                      <span>{link.label}</span>
                      {link.children?.length ? (
                        <svg
                          className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : null}
                    </Link>
                    {link.children?.length ? (
                      <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-2 rounded-lg border border-border bg-white py-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-primary-light hover:text-primary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </nav>

              <HeaderControls />
            </div>
          </div>
        </header>
      </div>

      <div className="h-16 md:h-[93px]" aria-hidden="true" />
    </>
  )
}

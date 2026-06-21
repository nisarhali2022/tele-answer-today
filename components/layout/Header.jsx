import Link from 'next/link'
import Image from 'next/image'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'
import HeaderControls from './HeaderControls'

export default function Header() {
  return (
    <>
      <div className="hidden bg-primary px-4 py-1.5 text-center text-xs text-white md:block">
        Get Today&apos;s Telenor Quiz Answers Daily - Win 150 MB Free Internet
        Every Day!
      </div>

      <header className="relative sticky top-0 z-50 w-full overflow-x-clip border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 min-w-0 items-center justify-between gap-3">
            <Link href="/" className="min-w-0 flex-shrink">
              <Image
                src={SITE_CONFIG.logoUrl}
                alt={SITE_CONFIG.name}
                width={220}
                height={50}
                className="h-10 w-auto max-w-[calc(100vw-8rem)] object-contain sm:h-11 sm:max-w-none"
                priority
              />
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded px-3 py-2 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-primary-light hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <HeaderControls />
          </div>
        </div>
      </header>
    </>
  )
}

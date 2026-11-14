import { Fragment } from 'react'
import AdInArticle from '@/components/ads/AdInArticle'
import { splitContentForAds } from '@/lib/utils'

// Renders CMS HTML with an in-content image ad after every 3rd top-level
// paragraph (at most 4 per page). `adClassName` wraps each ad, e.g. to hide
// it on phones.
export default function ContentWithAds({
  html,
  className,
  adClassName = '',
  every = 3,
  max = 4,
}) {
  const chunks = splitContentForAds(html, { every, max })

  return chunks.map((chunk, index) => (
    <Fragment key={index}>
      {index > 0 ? (
        adClassName ? (
          <div className={adClassName}>
            <AdInArticle />
          </div>
        ) : (
          <AdInArticle />
        )
      ) : null}
      {chunk ? (
        <div className={className} dangerouslySetInnerHTML={{ __html: chunk }} />
      ) : null}
    </Fragment>
  ))
}

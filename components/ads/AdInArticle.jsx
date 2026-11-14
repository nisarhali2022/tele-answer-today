'use client'

import AdImage from './AdImage'

// In-content 300x250 image ad, placed between paragraphs and below the quiz.
export default function AdInArticle({ className = 'my-8' }) {
  return <AdImage className={className} />
}

'use client'

export default function ErrorPage({ reset }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading font-bold text-2xl text-text-primary mb-3">
        Temporarily unavailable
      </h1>
      <p className="text-text-secondary max-w-md mb-6">
        We could not load the latest content from WordPress. Please try again
        in a moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="btn-primary"
      >
        Try again
      </button>
    </div>
  )
}

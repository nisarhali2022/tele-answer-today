export default function AdminQuizPage() {
  const cmsUrl = process.env.NEXT_PUBLIC_CMS_ADMIN_URL || ''

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
      <section className="w-full rounded-lg border border-border bg-white p-6 text-center shadow-sm">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Quiz Management Has Moved
        </h1>
        <p className="mt-3 text-text-secondary">
          Update the shared daily quiz in the Supabase Admin CMS. Changes are
          published to every connected website and revalidated automatically.
        </p>
        {cmsUrl ? (
          <a className="btn-primary mt-6 inline-flex rounded-lg" href={cmsUrl}>
            Open Admin CMS
          </a>
        ) : null}
      </section>
    </div>
  )
}

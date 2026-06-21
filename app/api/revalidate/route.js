import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { slug, type } = body;

    revalidatePath('/'); // always revalidate homepage (quiz lives here)

    if (slug) revalidatePath(`/${slug}`);

    return NextResponse.json({ revalidated: true, slug, type, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

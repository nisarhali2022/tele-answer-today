import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getRevalidationPaths } from '../../../lib/revalidation';

export async function POST(request) {
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { slug, type, path, category } = body;
    const paths = getRevalidationPaths({ path, slug, category });

    for (const revalidateTarget of paths) {
      revalidatePath(revalidateTarget);
    }

    return NextResponse.json({
      revalidated: true,
      slug,
      category,
      path,
      paths,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

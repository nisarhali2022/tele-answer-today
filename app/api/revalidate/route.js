import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import {
  normalizeCmsRevalidationPayload,
  verifyCmsRevalidationSecret,
} from '../../../lib/cms/revalidation';

export async function POST(request) {
  if (!verifyCmsRevalidationSecret(request, process.env.CMS_REVALIDATION_SECRET)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = normalizeCmsRevalidationPayload(
      await request.json().catch(() => ({}))
    );
    const paths = payload.paths.length > 0
      ? payload.paths
      : ['/', '/blog', '/sitemap_index.xml'];
    for (const path of paths) revalidatePath(path);
    revalidateTag('cms');

    return NextResponse.json({
      revalidated: true,
      paths,
      event: payload.event,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

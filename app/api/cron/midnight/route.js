import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getKarachiDateISO } from '@/lib/date'

export async function GET(request) {
  const authorization = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  revalidatePath('/')

  return NextResponse.json({
    revalidated: true,
    karachiDate: getKarachiDateISO(),
    timestamp: new Date().toISOString(),
  })
}

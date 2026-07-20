import { NextResponse } from 'next/server'

const message = 'Quiz management is handled by the shared Supabase Admin CMS.'

export function GET() {
  return NextResponse.json({ message }, { status: 410 })
}

export function POST() {
  return NextResponse.json({ message }, { status: 410 })
}

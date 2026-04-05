import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deckId = searchParams.get('deck_id') || undefined
  const limit = parseInt(searchParams.get('limit') || '20')
  const cards = db.getReviewCards(deckId, limit)
  return NextResponse.json(cards)
}

export async function POST(request: Request) {
  const body = await request.json()
  const result = db.recordReview(body.card_id, body.result)
  return NextResponse.json(result)
}

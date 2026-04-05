import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const decks = db.getDecks()
  return NextResponse.json(decks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const deck = db.createDeck({
    name: body.name,
    description: body.description,
    icon: body.icon,
    color: body.color,
    is_official: body.is_official || false,
    user_id: null,
    total_cards: body.total_cards || 0,
  })
  return NextResponse.json(deck, { status: 201 })
}

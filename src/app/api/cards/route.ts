import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cards = db.getCards()
  return NextResponse.json(cards)
}

export async function POST(request: Request) {
  const body = await request.json()
  const card = db.createCard({
    deck_id: body.deck_id,
    front: body.front,
    front_subtitle: body.front_subtitle,
    language: body.language,
    description: body.description,
    code_example: body.code_example,
    exercise: body.exercise,
    difficulty: body.difficulty || 1,
    status: 'new',
    next_review: new Date().toISOString().split('T')[0],
    user_id: null,
  })
  return NextResponse.json(card, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  db.deleteCard(id)
  return NextResponse.json({ success: true })
}

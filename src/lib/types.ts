export interface User {
  id: string; name: string; email: string | null; plan: 'free' | 'pro'; streak: number; created_at: string; updated_at: string
}
export interface Deck {
  id: string; name: string; description: string | null; icon: string | null; color: string | null;
  is_official: boolean; user_id: string | null; total_cards: number; created_at: string; updated_at: string
}
export interface Card {
  id: string; deck_id: string; user_id: string | null; front: string; front_subtitle: string | null;
  language: string; description: string | null; code_example: string | null; exercise: string | null;
  difficulty: number; status: 'new' | 'learning' | 'review' | 'dominated' | 'hard';
  next_review: string | null; created_at: string; updated_at: string
}
export interface ReviewHistory {
  id: string; user_id: string | null; card_id: string; result: 'easy' | 'medium' | 'hard'; created_at: string
}
export interface DailyActivity {
  id: string; user_id: string | null; date: string; cards_reviewed: number; correct_count: number; created_at: string
}

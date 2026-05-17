/** Supabase generated-style types for our schema */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          subject: string;
          topic: string;
          uworld_section: string;
          difficulty: string;
          tags: string[];
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notes"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
      };
      concept_reviews: {
        Row: {
          id: string;
          user_id: string;
          concept: string;
          subject: string;
          forget_count: number;
          last_reviewed: string | null;
          next_review: string;
          quiz_accuracy: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["concept_reviews"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["concept_reviews"]["Insert"]>;
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          concept: string;
          correct: boolean;
          difficulty: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_attempts"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Insert"]>;
      };
      study_streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_study_date: string;
        };
        Insert: Database["public"]["Tables"]["study_streaks"]["Row"];
        Update: Partial<Database["public"]["Tables"]["study_streaks"]["Insert"]>;
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          role: string;
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_messages"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
      };
    };
    Functions: {
      match_notes: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
          filter_user_id?: string;
        };
        Returns: {
          id: string;
          title: string;
          content: string;
          subject: string;
          topic: string;
          similarity: number;
        }[];
      };
    };
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          attempt_id: string
          question_id: string
          selected_option_id: string | null
        }
        Insert: {
          attempt_id: string
          question_id: string
          selected_option_id?: string | null
        }
        Update: {
          attempt_id?: string
          question_id?: string
          selected_option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mcq_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "mcq_options"
            referencedColumns: ["id"]
          },
        ]
      }
      course_participants: {
        Row: {
          course_id: string
          user_id: string
        }
        Insert: {
          course_id: string
          user_id: string
        }
        Update: {
          course_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_participants_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_subjects: {
        Row: {
          course_id: string
          subject_id: string
        }
        Insert: {
          course_id: string
          subject_id: string
        }
        Update: {
          course_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          created_by_id: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by_id: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by_id?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          created_at: string
          end_time: string | null
          exam_id: string | null
          id: string
          passed: boolean | null
          score: number | null
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          exam_id?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          exam_id?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_participants: {
        Row: {
          exam_id: string
          user_id: string
        }
        Insert: {
          exam_id: string
          user_id: string
        }
        Update: {
          exam_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_participants_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_subjects: {
        Row: {
          difficulty: string
          exam_id: string
          question_count: number
          subject_id: string
        }
        Insert: {
          difficulty: string
          exam_id: string
          question_count: number
          subject_id: string
        }
        Update: {
          difficulty?: string
          exam_id?: string
          question_count?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_subjects_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          course_id: string | null
          created_at: string
          created_by_id: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
          passing_percentage: number
          scheduled_date: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by_id: string
          description?: string | null
          duration_minutes: number
          id?: string
          name: string
          passing_percentage: number
          scheduled_date?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by_id?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          passing_percentage?: number
          scheduled_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_options: {
        Row: {
          id: string
          is_correct: boolean
          question_id: string
          text: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          question_id: string
          text: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mcq_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_questions: {
        Row: {
          created_at: string
          created_by_id: string
          difficulty: string
          id: string
          subject_id: string
          text: string
        }
        Insert: {
          created_at?: string
          created_by_id: string
          difficulty: string
          id?: string
          subject_id: string
          text: string
        }
        Update: {
          created_at?: string
          created_by_id?: string
          difficulty?: string
          id?: string
          subject_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          created_by_id: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by_id: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by_id?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

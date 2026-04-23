// Sostituire con generazione automatica dopo aver collegato Supabase CLI:
// npx supabase gen types typescript --project-id dfmmzbklpysyjkgnvzzy > src/lib/supabase/types.ts

export type UserRole = "player" | "coach" | "scout";
export type CertificationStatus = "pending" | "approved" | "rejected";
export type SubscriptionStatus = "inactive" | "trial" | "active" | "expired";
export type PlayerPosition =
  | "portiere"
  | "difensore"
  | "centrocampista"
  | "ala"
  | "attaccante";
export type FigcLicenseType = "UEFA A" | "UEFA B" | "UEFA C" | "Patentino";
export type DeviceType = "ios" | "android" | "web";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          role?: UserRole;
          full_name?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      player_profiles: {
        Row: {
          id: string;
          birth_date: string;
          position: PlayerPosition | null;
          bio: string | null;
          city: string | null;
          team_name: string | null;
          is_verified: boolean;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          id: string;
          birth_date: string;
          position?: PlayerPosition | null;
          bio?: string | null;
          city?: string | null;
          team_name?: string | null;
          is_verified?: boolean;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          birth_date?: string;
          position?: PlayerPosition | null;
          bio?: string | null;
          city?: string | null;
          team_name?: string | null;
          is_verified?: boolean;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [];
      };
      coach_profiles: {
        Row: {
          id: string;
          figc_license_number: string;
          figc_license_type: FigcLicenseType | null;
          team_name: string | null;
          city: string | null;
        };
        Insert: {
          id: string;
          figc_license_number: string;
          figc_license_type?: FigcLicenseType | null;
          team_name?: string | null;
          city?: string | null;
        };
        Update: {
          figc_license_number?: string;
          figc_license_type?: FigcLicenseType | null;
          team_name?: string | null;
          city?: string | null;
        };
        Relationships: [];
      };
      scout_profiles: {
        Row: {
          id: string;
          organization: string | null;
          subscription_status: SubscriptionStatus;
          subscription_expires_at: string | null;
        };
        Insert: {
          id: string;
          organization?: string | null;
          subscription_status?: SubscriptionStatus;
          subscription_expires_at?: string | null;
        };
        Update: {
          organization?: string | null;
          subscription_status?: SubscriptionStatus;
          subscription_expires_at?: string | null;
        };
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          player_id: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          views_count: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          views_count?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          views_count?: number;
          is_published?: boolean;
        };
        Relationships: [];
      };
      certification_requests: {
        Row: {
          id: string;
          player_id: string;
          coach_id: string;
          status: CertificationStatus;
          player_message: string | null;
          rejection_reason: string | null;
          requested_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          player_id: string;
          coach_id: string;
          status?: CertificationStatus;
          player_message?: string | null;
          rejection_reason?: string | null;
          requested_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          coach_id?: string;
          status?: CertificationStatus;
          player_message?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
      fcm_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          device_type: DeviceType | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          device_type?: DeviceType | null;
          created_at?: string;
        };
        Update: {
          token?: string;
          device_type?: DeviceType | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

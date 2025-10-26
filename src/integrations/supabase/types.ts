export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      competitor_intelligence: {
        Row: {
          analysis_date: string
          backlinks_count: number | null
          code_snippets_count: number | null
          competitor_domain: string
          competitor_id: string
          content_gaps_identified: string | null
          content_last_updated: string | null
          content_structure: string | null
          content_weaknesses: string | null
          content_word_count: number | null
          created_at: string
          cta_elements_count: number | null
          current_ranking_position: number | null
          domain_authority: number | null
          estimated_monthly_traffic: number | null
          external_links_count: number | null
          images_count: number | null
          internal_links_count: number | null
          keyword_id: string | null
          meta_description: string | null
          mobile_score: number | null
          optimization_opportunities: string | null
          page_load_speed: number | null
          page_title: string | null
          page_url: string | null
          social_shares_total: number | null
          videos_count: number | null
        }
        Insert: {
          analysis_date?: string
          backlinks_count?: number | null
          code_snippets_count?: number | null
          competitor_domain: string
          competitor_id?: string
          content_gaps_identified?: string | null
          content_last_updated?: string | null
          content_structure?: string | null
          content_weaknesses?: string | null
          content_word_count?: number | null
          created_at?: string
          cta_elements_count?: number | null
          current_ranking_position?: number | null
          domain_authority?: number | null
          estimated_monthly_traffic?: number | null
          external_links_count?: number | null
          images_count?: number | null
          internal_links_count?: number | null
          keyword_id?: string | null
          meta_description?: string | null
          mobile_score?: number | null
          optimization_opportunities?: string | null
          page_load_speed?: number | null
          page_title?: string | null
          page_url?: string | null
          social_shares_total?: number | null
          videos_count?: number | null
        }
        Update: {
          analysis_date?: string
          backlinks_count?: number | null
          code_snippets_count?: number | null
          competitor_domain?: string
          competitor_id?: string
          content_gaps_identified?: string | null
          content_last_updated?: string | null
          content_structure?: string | null
          content_weaknesses?: string | null
          content_word_count?: number | null
          created_at?: string
          cta_elements_count?: number | null
          current_ranking_position?: number | null
          domain_authority?: number | null
          estimated_monthly_traffic?: number | null
          external_links_count?: number | null
          images_count?: number | null
          internal_links_count?: number | null
          keyword_id?: string | null
          meta_description?: string | null
          mobile_score?: number | null
          optimization_opportunities?: string | null
          page_load_speed?: number | null
          page_title?: string | null
          page_url?: string | null
          social_shares_total?: number | null
          videos_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_intelligence_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keyword_intelligence"
            referencedColumns: ["keyword_id"]
          },
        ]
      }
      content_briefs: {
        Row: {
          brief_id: string
          claude_prompt_optimized: string | null
          code_examples_needed: string | null
          competitor_gaps_to_exploit: string | null
          content_angle: string | null
          content_urgency_score: number | null
          creation_date: string
          estimated_time_to_rank_weeks: number | null
          expected_revenue_estimate: number | null
          expected_traffic_estimate: number | null
          external_linking_targets: string | null
          faq_questions: string | null
          gumroad_placement_strategy: string | null
          image_requirements: string | null
          internal_linking_strategy: string | null
          juhu_processing_notes: string | null
          keyword_id: string | null
          must_include_topics: string | null
          recommended_structure: string | null
          scheduled_publish_date: string | null
          semantic_keywords: string | null
          status: string | null
          target_word_count: number | null
          trend_id: string | null
          video_requirements: string | null
        }
        Insert: {
          brief_id?: string
          claude_prompt_optimized?: string | null
          code_examples_needed?: string | null
          competitor_gaps_to_exploit?: string | null
          content_angle?: string | null
          content_urgency_score?: number | null
          creation_date?: string
          estimated_time_to_rank_weeks?: number | null
          expected_revenue_estimate?: number | null
          expected_traffic_estimate?: number | null
          external_linking_targets?: string | null
          faq_questions?: string | null
          gumroad_placement_strategy?: string | null
          image_requirements?: string | null
          internal_linking_strategy?: string | null
          juhu_processing_notes?: string | null
          keyword_id?: string | null
          must_include_topics?: string | null
          recommended_structure?: string | null
          scheduled_publish_date?: string | null
          semantic_keywords?: string | null
          status?: string | null
          target_word_count?: number | null
          trend_id?: string | null
          video_requirements?: string | null
        }
        Update: {
          brief_id?: string
          claude_prompt_optimized?: string | null
          code_examples_needed?: string | null
          competitor_gaps_to_exploit?: string | null
          content_angle?: string | null
          content_urgency_score?: number | null
          creation_date?: string
          estimated_time_to_rank_weeks?: number | null
          expected_revenue_estimate?: number | null
          expected_traffic_estimate?: number | null
          external_linking_targets?: string | null
          faq_questions?: string | null
          gumroad_placement_strategy?: string | null
          image_requirements?: string | null
          internal_linking_strategy?: string | null
          juhu_processing_notes?: string | null
          keyword_id?: string | null
          must_include_topics?: string | null
          recommended_structure?: string | null
          scheduled_publish_date?: string | null
          semantic_keywords?: string | null
          status?: string | null
          target_word_count?: number | null
          trend_id?: string | null
          video_requirements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_briefs_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keyword_intelligence"
            referencedColumns: ["keyword_id"]
          },
          {
            foreignKeyName: "content_briefs_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trend_master"
            referencedColumns: ["trend_id"]
          },
        ]
      }
      keyword_intelligence: {
        Row: {
          ahrefs_data: string | null
          commercial_intent_score: number | null
          content_creation_status: string | null
          cpc_value: number | null
          created_at: string
          keyword_difficulty: number | null
          keyword_id: string
          keyword_variations: string | null
          last_updated: string
          opportunity_score: number | null
          primary_keyword: string
          priority_level: string | null
          related_questions: string | null
          search_intent: string | null
          search_volume_monthly: number | null
          search_volume_trend: string | null
          seasonal_pattern: string | null
          semrush_data: string | null
          serp_features: string | null
          trend_id: string | null
          ubersuggest_data: string | null
        }
        Insert: {
          ahrefs_data?: string | null
          commercial_intent_score?: number | null
          content_creation_status?: string | null
          cpc_value?: number | null
          created_at?: string
          keyword_difficulty?: number | null
          keyword_id?: string
          keyword_variations?: string | null
          last_updated?: string
          opportunity_score?: number | null
          primary_keyword: string
          priority_level?: string | null
          related_questions?: string | null
          search_intent?: string | null
          search_volume_monthly?: number | null
          search_volume_trend?: string | null
          seasonal_pattern?: string | null
          semrush_data?: string | null
          serp_features?: string | null
          trend_id?: string | null
          ubersuggest_data?: string | null
        }
        Update: {
          ahrefs_data?: string | null
          commercial_intent_score?: number | null
          content_creation_status?: string | null
          cpc_value?: number | null
          created_at?: string
          keyword_difficulty?: number | null
          keyword_id?: string
          keyword_variations?: string | null
          last_updated?: string
          opportunity_score?: number | null
          primary_keyword?: string
          priority_level?: string | null
          related_questions?: string | null
          search_intent?: string | null
          search_volume_monthly?: number | null
          search_volume_trend?: string | null
          seasonal_pattern?: string | null
          semrush_data?: string | null
          serp_features?: string | null
          trend_id?: string | null
          ubersuggest_data?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_intelligence_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trend_master"
            referencedColumns: ["trend_id"]
          },
        ]
      }
      keyword_variations: {
        Row: {
          analyzed_at: string | null
          category: string | null
          commercial_intent: string | null
          competition_score: number | null
          created_at: string | null
          growth_rate: number | null
          hn_mentions: number | null
          hn_points: number | null
          id: string
          interest_data: Json | null
          keyword: string
          notes: string | null
          published_at: string | null
          reddit_mentions: number | null
          reddit_upvotes: number | null
          related_queries: Json | null
          run_id: string | null
          search_volume: number | null
          serp_features: Json | null
          source: string | null
          source_data: Json | null
          source_item: string | null
          status: string | null
          total_engagement: number | null
          trend_score: number | null
          trend_velocity: string | null
          twitter_engagement: number | null
          twitter_mentions: number | null
          type: string
        }
        Insert: {
          analyzed_at?: string | null
          category?: string | null
          commercial_intent?: string | null
          competition_score?: number | null
          created_at?: string | null
          growth_rate?: number | null
          hn_mentions?: number | null
          hn_points?: number | null
          id?: string
          interest_data?: Json | null
          keyword: string
          notes?: string | null
          published_at?: string | null
          reddit_mentions?: number | null
          reddit_upvotes?: number | null
          related_queries?: Json | null
          run_id?: string | null
          search_volume?: number | null
          serp_features?: Json | null
          source?: string | null
          source_data?: Json | null
          source_item?: string | null
          status?: string | null
          total_engagement?: number | null
          trend_score?: number | null
          trend_velocity?: string | null
          twitter_engagement?: number | null
          twitter_mentions?: number | null
          type?: string
        }
        Update: {
          analyzed_at?: string | null
          category?: string | null
          commercial_intent?: string | null
          competition_score?: number | null
          created_at?: string | null
          growth_rate?: number | null
          hn_mentions?: number | null
          hn_points?: number | null
          id?: string
          interest_data?: Json | null
          keyword?: string
          notes?: string | null
          published_at?: string | null
          reddit_mentions?: number | null
          reddit_upvotes?: number | null
          related_queries?: Json | null
          run_id?: string | null
          search_volume?: number | null
          serp_features?: Json | null
          source?: string | null
          source_data?: Json | null
          source_item?: string | null
          status?: string | null
          total_engagement?: number | null
          trend_score?: number | null
          trend_velocity?: string | null
          twitter_engagement?: number | null
          twitter_mentions?: number | null
          type?: string
        }
        Relationships: []
      }
      performance_tracking: {
        Row: {
          backlinks_earned: number | null
          bounce_rate: number | null
          click_through_rate: number | null
          content_url: string | null
          conversion_rate: number | null
          created_at: string
          current_ranking_position: number | null
          gumroad_sales_attributed: number | null
          keyword_id: string | null
          last_updated: string
          monthly_organic_traffic: number | null
          monthly_organic_traffic_value: number | null
          publish_date: string | null
          ranking_history: string | null
          revenue_generated: number | null
          social_shares_total: number | null
          time_on_page_seconds: number | null
          tracking_id: string
          traffic_history: string | null
        }
        Insert: {
          backlinks_earned?: number | null
          bounce_rate?: number | null
          click_through_rate?: number | null
          content_url?: string | null
          conversion_rate?: number | null
          created_at?: string
          current_ranking_position?: number | null
          gumroad_sales_attributed?: number | null
          keyword_id?: string | null
          last_updated?: string
          monthly_organic_traffic?: number | null
          monthly_organic_traffic_value?: number | null
          publish_date?: string | null
          ranking_history?: string | null
          revenue_generated?: number | null
          social_shares_total?: number | null
          time_on_page_seconds?: number | null
          tracking_id?: string
          traffic_history?: string | null
        }
        Update: {
          backlinks_earned?: number | null
          bounce_rate?: number | null
          click_through_rate?: number | null
          content_url?: string | null
          conversion_rate?: number | null
          created_at?: string
          current_ranking_position?: number | null
          gumroad_sales_attributed?: number | null
          keyword_id?: string | null
          last_updated?: string
          monthly_organic_traffic?: number | null
          monthly_organic_traffic_value?: number | null
          publish_date?: string | null
          ranking_history?: string | null
          revenue_generated?: number | null
          social_shares_total?: number | null
          time_on_page_seconds?: number | null
          tracking_id?: string
          traffic_history?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_tracking_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keyword_intelligence"
            referencedColumns: ["keyword_id"]
          },
        ]
      }
      pipeline_runs: {
        Row: {
          completed_at: string | null
          cost_usd: number | null
          error_message: string | null
          error_stack: string | null
          external_sources_fetched: number | null
          id: string
          keywords_checked: number | null
          keywords_saved: number | null
          results: Json | null
          runtime_seconds: number | null
          started_at: string | null
          status: string | null
          trending_keywords_found: number | null
          variations_generated: number | null
        }
        Insert: {
          completed_at?: string | null
          cost_usd?: number | null
          error_message?: string | null
          error_stack?: string | null
          external_sources_fetched?: number | null
          id?: string
          keywords_checked?: number | null
          keywords_saved?: number | null
          results?: Json | null
          runtime_seconds?: number | null
          started_at?: string | null
          status?: string | null
          trending_keywords_found?: number | null
          variations_generated?: number | null
        }
        Update: {
          completed_at?: string | null
          cost_usd?: number | null
          error_message?: string | null
          error_stack?: string | null
          external_sources_fetched?: number | null
          id?: string
          keywords_checked?: number | null
          keywords_saved?: number | null
          results?: Json | null
          runtime_seconds?: number | null
          started_at?: string | null
          status?: string | null
          trending_keywords_found?: number | null
          variations_generated?: number | null
        }
        Relationships: []
      }
      trend_master: {
        Row: {
          created_at: string
          discovery_date: string
          estimated_peak_date: string | null
          github_repo_count: number | null
          google_trends_score: number | null
          last_updated: string
          news_articles_count: number | null
          reddit_engagement_score: number | null
          social_mentions_count: number | null
          status: string | null
          trend_category: string | null
          trend_id: string
          trend_momentum_score: number | null
          trend_source: string | null
          trend_sustainability_score: number | null
          trend_topic: string
          twitter_hashtag_volume: number | null
        }
        Insert: {
          created_at?: string
          discovery_date?: string
          estimated_peak_date?: string | null
          github_repo_count?: number | null
          google_trends_score?: number | null
          last_updated?: string
          news_articles_count?: number | null
          reddit_engagement_score?: number | null
          social_mentions_count?: number | null
          status?: string | null
          trend_category?: string | null
          trend_id?: string
          trend_momentum_score?: number | null
          trend_source?: string | null
          trend_sustainability_score?: number | null
          trend_topic: string
          twitter_hashtag_volume?: number | null
        }
        Update: {
          created_at?: string
          discovery_date?: string
          estimated_peak_date?: string | null
          github_repo_count?: number | null
          google_trends_score?: number | null
          last_updated?: string
          news_articles_count?: number | null
          reddit_engagement_score?: number | null
          social_mentions_count?: number | null
          status?: string | null
          trend_category?: string | null
          trend_id?: string
          trend_momentum_score?: number | null
          trend_source?: string | null
          trend_sustainability_score?: number | null
          trend_topic?: string
          twitter_hashtag_volume?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_keyword_stats: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

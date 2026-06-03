// ─────────────────────────────────────────────
// Supabase table types
// Keep in sync with supabase/migrations/
// ─────────────────────────────────────────────

export type ReportStatus = 'current' | 'refresh_due' | 'running'

export interface ResearchReport {
  id: string
  title: string
  generated_at: string       // ISO 8601 timestamptz
  refreshed_at: string       // ISO 8601 timestamptz
  report_url: string | null  // path to .docx
  deck_url: string | null    // path to .pptx
  findings: Record<string, string | string[]> | null  // jsonb key stats
  status: ReportStatus
  created_at: string
}

// ─────────────────────────────────────────────
// Other shared table types
// ─────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'proposal' | 'closed'

export interface Lead {
  id: string
  name: string
  what_they_want: string | null
  source: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
}

export type ProductStatus = 'building' | 'live' | 'giving away' | 'selling'

export interface Product {
  id: string
  name: string
  description: string | null
  url: string | null
  status: ProductStatus
  created_at: string
}

export type AgentLogStatus = 'success' | 'error' | 'pending'

export interface AgentLog {
  id: string
  agent_name: string
  action: string
  output: { message?: string; [key: string]: unknown } | null
  status: AgentLogStatus
  created_at: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export interface Task {
  id: string
  task: string
  assigned_to: string | null
  triggered_by: string | null
  status: TaskStatus
  depends_on: string | null  // uuid ref to tasks.id
  created_at: string
}

export type ContentPlatform = 'substack' | 'instagram' | 'linkedin' | 'facebook' | 'twitter'
export type ContentStatus = 'draft' | 'sent' | 'published' | 'scheduled'

export interface ContentPost {
  id: string
  title: string
  body: string
  platform: ContentPlatform
  status: ContentStatus
  related_app: string | null
  post_url: string | null
  draft_sent_at: string | null
  published_at: string | null
  agent_name: string
  created_at: string
}

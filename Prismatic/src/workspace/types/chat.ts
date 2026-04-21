// ─── Chat Types ─────────────────────────────────────────────────────────────

export type ResponseType = 'scan' | 'transform' | 'audit' | 'info'

// ── Scan ────────────────────────────────────────────────────────────────────
export interface PieSlice {
  name: string
  value: number
}

export interface ScanData {
  total_records: number
  average_confidence: number
  pii_types: PieSlice[]       // for pie chart
  laws: string[]
  top_fields: string[]
}

// ── Transform ───────────────────────────────────────────────────────────────
export interface TransformData {
  total_records: number
  average_confidence: number
  transformation_types: PieSlice[]  // for bar chart
  pii_types: PieSlice[]
  laws_applied: string[]
}

// ── Audit ───────────────────────────────────────────────────────────────────
export interface AuditEntry {
  pii: string
  action: string
  laws: string[]
  phase: string
  confidence: number
  timestamp: string
}

export interface AuditData {
  total: number
  average_confidence: number
  entries: AuditEntry[]
  pii_counts: PieSlice[]
  action_counts: PieSlice[]
}

// ── Message ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string               // plain summary / user text
  responseType?: ResponseType
  data?: ScanData | TransformData | AuditData
  timestamp: Date
  loading?: boolean             // skeleton state while waiting
}

// ── API ─────────────────────────────────────────────────────────────────────
export interface ChatApiResponse {
  type: ResponseType
  summary: string
  data: ScanData | TransformData | AuditData
  session_id: string
}

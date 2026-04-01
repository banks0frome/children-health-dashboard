export type SubmissionStatus = "submitted" | "in_review" | "approved" | "denied" | "fulfilled";
export type SubmissionMethod = "upload" | "paste" | "form" | "chat";
export type RequestType = "mailing" | "event" | "both";

export interface AIClassification {
  type_confidence: number;
  priority_score: number;
  risk_flags: string[];
  fulfillment_recommendation: "mail" | "staff" | "both";
  approval_recommendation: "auto_approve" | "manual_review";
  confidence_pct: number;
  reasoning: string;
}

export interface Submission {
  id: string;
  status: SubmissionStatus;
  submission_method: SubmissionMethod;
  request_type: RequestType;
  first_name: string;
  last_name: string;
  organization: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  ai_classification: AIClassification | null;
  ai_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  denial_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  event_details?: EventDetails | null;
  location?: Location | null;
  materials?: MaterialRequested[];
  shipping?: ShippingInfo | null;
  virtual_details?: VirtualDetails | null;
  activity_log?: ActivityLogEntry[];
}

export interface EventDetails {
  id: string;
  submission_id: string;
  event_name: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  estimated_attendance: number | null;
  audience_type: string[];
  topics: string[];
  is_virtual: boolean;
  requester_attending: boolean;
}

export interface Location {
  id: string;
  submission_id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  county: string | null;
  indoor_outdoor: "indoor" | "outdoor" | "both" | null;
  parking_instructions: string | null;
}

export interface MaterialRequested {
  id: string;
  submission_id: string;
  material_key: string;
  material_name: string;
  quantity: number;
  category: string | null;
  has_digital: boolean;
}

export interface ShippingInfo {
  id: string;
  submission_id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  county: string | null;
}

export interface VirtualDetails {
  id: string;
  submission_id: string;
  meeting_link: string | null;
  platform: "zoom" | "teams" | "other" | null;
}

export interface ActivityLogEntry {
  id: string;
  submission_id: string;
  action: string;
  actor: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  availability: Record<string, boolean>;
  expertise: string[];
  service_area: string[];
}

export interface StatsOverview {
  pending_review: number;
  events_this_week: number;
  auto_approved_today: number;
  avg_response_hours: number;
}

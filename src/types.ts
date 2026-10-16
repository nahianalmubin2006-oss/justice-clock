export type Language = 'en' | 'bn';

export type District =
  | 'dhaka'
  | 'chattogram'
  | 'rajshahi'
  | 'khulna'
  | 'sylhet'
  | 'barishal'
  | 'rangpur'
  | 'mymensingh';

export type CaseStatus =
  | 'reported'
  | 'investigation'
  | 'awaiting_trial'
  | 'trial'
  | 'judgment'
  | 'appeal'
  | 'other'
  | 'unverified';

export type VerificationStatus = 'unverified' | 'partial' | 'verified';

export type DatePrecision = 'day' | 'month' | 'unknown';

export type PublicationStatus = 'draft' | 'published' | 'archived';

export type TimelineStage =
  | 'reported'
  | 'filed'
  | 'investigation'
  | 'trial'
  | 'judgment'
  | 'appeal'
  | 'other';

export interface DatabaseEvent {
  id?: string;
  caseId: string;
  stage: TimelineStage;
  eventDate: string | null;
  titleBn: string;
  titleEn: string;
  verificationStatus: VerificationStatus;
  visibility: 'public' | 'internal';
  createdAt?: string;
}

export interface DatabaseSource {
  id?: string;
  caseId: string;
  publisher: string;
  url: string;
  sourceType: 'court_record' | 'reputable_news' | 'official_statement' | 'other';
  publicationDate: string | null;
  dateAccessed: string;
  verificationStatus: VerificationStatus;
  supportedFields?: string[];
  notes?: string;
}

export interface DatabaseCase {
  id: string; // e.g. JC-BD-0001
  docId?: string; // Firestore document ID
  titleBn: string;
  titleEn: string;
  incidentDate: string | null; // ISO YYYY-MM-DD or full ISO
  datePrecision: DatePrecision;
  dateExplanation?: string;
  complaintDate: string | null;
  district: District;
  locationDetails?: string;
  courtName: string | null;
  legalStatus: CaseStatus;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string;
  publicationStatus: PublicationStatus;
  internalNotes?: string;
  sourceUrls?: string[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  // Included populated sub-items for UI consumption
  events?: DatabaseEvent[];
  sources?: DatabaseSource[];
}

export interface NewsLeadItem {
  id?: string;
  headline: string;
  publisher: string;
  articleUrl: string;
  publishedAt: string;
  retrievedAt: string;
  excerpt: string;
  aiSummary: string;
  aiConfidence: number; // 0 - 100
  suggestedIncidentDate: string | null;
  suggestedDistrict: string | null;
  suggestedStatus: string | null;
  missingInfoWarnings?: string[];
  possibleDuplicateCaseId?: string | null;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'duplicate' | 'archived';
  reviewerNotes?: string;
}

export interface NewsSourceItem {
  id?: string;
  name: string;
  feedUrl: string;
  sourceType: 'rss' | 'api' | 'official';
  enabled: boolean;
  lastCheckedAt: string | null;
  lastError: string | null;
  updateFrequencyMinutes: number;
}

export interface CorrectionItem {
  id?: string;
  caseId: string | null;
  message: string;
  contactEmail: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface AdminActivityItem {
  id?: string;
  action: string;
  targetType: string;
  targetId: string;
  userEmail: string;
  timestamp: string;
  details?: string;
}

export interface AdminUserItem {
  uid: string;
  email: string;
  role: 'superadmin' | 'editor';
  addedAt: string;
}

// Display representation compatible with existing cards and components
export interface CaseItem {
  id: string;
  n: number;
  date: string | null;
  prec: DatePrecision;
  district: District;
  status: CaseStatus;
  ver: VerificationStatus;
  filed: string | null;
  court: string | null;
  verified: string | null;
  tl: [string, string | null][];
  titleBn?: string;
  titleEn?: string;
  sources?: DatabaseSource[];
  raw?: DatabaseCase;
}

export interface StatItem {
  key: string;
  count: number;
}

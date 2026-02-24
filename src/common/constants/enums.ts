export const ONBOARDING_STATES = {
  candidate_created: 'candidate_created',
  packet_assigned: 'packet_assigned',
  in_progress: 'in_progress',
  pending_hr_review: 'pending_hr_review',
  approved: 'approved',
  employee_active: 'employee_active',
} as const;

export const ONBOARDING_STATE_ORDER: string[] = [
  'candidate_created',
  'packet_assigned',
  'in_progress',
  'pending_hr_review',
  'approved',
  'employee_active',
];

export const TASK_STATUSES = {
  draft: 'draft',
  submitted: 'submitted',
  approved: 'approved',
  rejected: 'rejected',
} as const;

export const TASK_TYPES = {
  personal_info: 'personal_info',
  government_forms: 'government_forms',
  document_upload: 'document_upload',
  policy_acknowledgment: 'policy_acknowledgment',
  training_acknowledgment: 'training_acknowledgment',
  e_signature: 'e_signature',
  role_confirmation: 'role_confirmation',
} as const;

export const USER_ROLES = {
  admin: 'admin',
  hr: 'hr',
  manager: 'manager',
  employee: 'employee',
} as const;

export const EMPLOYMENT_TYPES = {
  full_time: 'full_time',
  part_time: 'part_time',
  contract: 'contract',
  intern: 'intern',
} as const;

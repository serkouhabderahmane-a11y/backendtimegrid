"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPLOYMENT_TYPES = exports.USER_ROLES = exports.TASK_TYPES = exports.TASK_STATUSES = exports.ONBOARDING_STATE_ORDER = exports.ONBOARDING_STATES = void 0;
exports.ONBOARDING_STATES = {
    candidate_created: 'candidate_created',
    packet_assigned: 'packet_assigned',
    in_progress: 'in_progress',
    pending_hr_review: 'pending_hr_review',
    approved: 'approved',
    employee_active: 'employee_active',
};
exports.ONBOARDING_STATE_ORDER = [
    'candidate_created',
    'packet_assigned',
    'in_progress',
    'pending_hr_review',
    'approved',
    'employee_active',
];
exports.TASK_STATUSES = {
    draft: 'draft',
    submitted: 'submitted',
    approved: 'approved',
    rejected: 'rejected',
};
exports.TASK_TYPES = {
    personal_info: 'personal_info',
    government_forms: 'government_forms',
    document_upload: 'document_upload',
    policy_acknowledgment: 'policy_acknowledgment',
    training_acknowledgment: 'training_acknowledgment',
    e_signature: 'e_signature',
    role_confirmation: 'role_confirmation',
};
exports.USER_ROLES = {
    admin: 'admin',
    hr: 'hr',
    manager: 'manager',
    employee: 'employee',
};
exports.EMPLOYMENT_TYPES = {
    full_time: 'full_time',
    part_time: 'part_time',
    contract: 'contract',
    intern: 'intern',
};
//# sourceMappingURL=enums.js.map
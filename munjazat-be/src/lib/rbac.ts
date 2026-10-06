import type { Role, SubmissionStatus } from '../db/schema'

const CP_STATUSES: SubmissionStatus[] = ['submitted', 'cp_review', 'needs_info']
const COMMITTEE_STATUSES: SubmissionStatus[] = ['committee_review', 'verified', 'needs_info']

export function visibleStatusesForRole(role: Role | string): SubmissionStatus[] | null {
  if (role === 'contact_point') return CP_STATUSES
  if (role === 'committee_member' || role === 'expert') return COMMITTEE_STATUSES
  return null
}

export function allowedTransitions(role: Role | string, from: SubmissionStatus): SubmissionStatus[] {
  if (role === 'analyst') return []

  if (role === 'contact_point') {
    if (from === 'submitted' || from === 'cp_review' || from === 'needs_info') {
      return ['cp_review', 'committee_review', 'needs_info', 'rejected']
    }
    return []
  }

  if (role === 'committee_member' || role === 'expert') {
    if (from === 'committee_review') return ['verified', 'needs_info', 'rejected']
    if (from === 'needs_info') return ['committee_review']
    return []
  }

  const open: SubmissionStatus[] = [
    'submitted',
    'cp_review',
    'needs_info',
    'committee_review',
    'verified',
    'published',
    'rejected',
    'archived',
  ]
  return open.filter((status) => status !== from)
}

export function canManageGovernance(role: Role | string) {
  return role === 'embassy_admin' || role === 'committee_chair'
}

export function canPublish(role: Role | string) {
  return role === 'embassy_admin' || role === 'committee_chair'
}

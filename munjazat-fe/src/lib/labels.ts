export const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  submitted: 'مُقدَّم',
  cp_review: 'مراجعة نقطة الاتصال',
  needs_info: 'يحتاج استكمال',
  committee_review: 'مراجعة اللجنة',
  verified: 'موثَّق',
  published: 'منشور',
  rejected: 'مرفوض',
  archived: 'مؤرشف',
}

export const entityKindLabels: Record<string, string> = {
  person: 'كفاءة',
  organization: 'جهة',
  achievement: 'منجز',
}

export const roleLabels: Record<string, string> = {
  embassy_admin: 'مدير البعثة',
  committee_chair: 'رئيس اللجنة',
  committee_member: 'عضو لجنة',
  contact_point: 'نقطة اتصال',
  expert: 'خبير',
  analyst: 'محلل',
}

export const contactPointLabels: Record<string, string> = {
  ankara: 'أنقرة',
  istanbul: 'إسطنبول',
  gaziantep: 'غازي عنتاب',
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ar')
}

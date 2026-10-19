interface StatusBadgeProps {
  status: string
}

const config: Record<string, { bg: string; text: string; label: string }> = {
  scheduled:  { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Scheduled' },
  completed:  { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed' },
  cancelled:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled' },
  'no-show':  { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'No-show' },
  pending:    { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Pending' },
  consultation: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Consultation' },
  'follow-up':  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Follow-up' },
  emergency:    { bg: 'bg-red-100',   text: 'text-red-700',    label: 'Emergency' },
  routine:      { bg: 'bg-teal-100',  text: 'text-teal-700',   label: 'Routine' },
  mild:         { bg: 'bg-green-100', text: 'text-green-700',  label: 'Mild' },
  moderate:     { bg: 'bg-amber-100', text: 'text-amber-700',  label: 'Moderate' },
  severe:       { bg: 'bg-red-100',   text: 'text-red-700',    label: 'Severe' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = (status ?? '').toLowerCase()
  const c = config[s] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: status }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

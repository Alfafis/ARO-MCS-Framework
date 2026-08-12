import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-xs font-medium text-[var(--c-text-2)] mb-1', className)}
      {...props}
    />
  )
}

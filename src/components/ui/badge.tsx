import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-[3px] text-[0.75rem] font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default:  'bg-[#f0eeec] text-c-text-2',
        accent:   'bg-accent-100 text-accent-700',
        success:  'bg-success-bg text-success',
        warning:  'bg-yellow-50 text-yellow-700',
        validado: 'bg-success-bg text-success',
        revisao:  'bg-[#f0eeec] text-c-text-2',
        pendente: 'bg-[#fff3e0] text-[#b45309] whitespace-normal text-center leading-snug',
        rev:      'bg-[#f0eeec] text-c-text-2 font-mono',
        mono:     'bg-[#f0eeec] text-c-text font-mono',
        line:     'bg-[#f0eeec] text-c-text-2',
        status:   'bg-success-bg text-success',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

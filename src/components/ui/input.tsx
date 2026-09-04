import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full text-[0.875rem] text-c-text placeholder:text-c-text-2 outline-none transition-colors',
  {
    variants: {
      variant: {
        default:
          'rounded-full border border-c-line bg-c-card px-3 py-2 focus:border-accent focus:ring-2 focus:ring-accent/20',
        filled: 'rounded-[11px] border-none bg-c-surface-2 px-[13px] py-[9px] focus:shadow-[0_0_0_1.5px_var(--accent)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

export function Input({ className, variant, ...props }: InputProps) {
  return <input className={cn(inputVariants({ variant }), className)} {...props} />
}

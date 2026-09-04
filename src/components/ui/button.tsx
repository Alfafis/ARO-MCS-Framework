import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-white rounded-full px-5 py-[11px] text-[13.5px] hover:bg-accent-700 whitespace-nowrap flex-none transition-colors duration-[220ms]',
        ghost:
          'bg-c-card text-c-text rounded-full px-5 py-[11px] text-[13.5px] whitespace-nowrap flex-none shadow-[0_1px_3px_rgba(20,21,26,.08)] hover:shadow-[0_4px_12px_rgba(20,21,26,.14)] hover:-translate-y-px transition-[box-shadow,transform] duration-[220ms]',
        icon: 'w-7 h-7 rounded-md text-c-text-2 hover:bg-c-surface-2-hover font-medium',
        'icon-btn': 'w-7 h-7 rounded-md text-c-text-2 hover:bg-c-surface-2-hover font-medium',
        'icon-danger': 'w-7 h-7 rounded-md text-accent-700 hover:bg-accent-100 font-medium',
        menu: 'w-full px-[10px] py-2 text-[13px] font-medium text-c-text rounded-[8px] hover:bg-c-surface-2-hover justify-start',
        'menu-danger':
          'w-full px-[10px] py-2 text-[13px] font-medium text-accent-700 rounded-[8px] hover:bg-accent-100 justify-start',
        link: 'text-accent text-[13px] underline-offset-4 hover:underline font-medium',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />
}

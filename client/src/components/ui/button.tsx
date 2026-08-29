import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#19d879] text-[#06140d] shadow-[0_0_14px_rgba(25,216,121,0.22)] hover:bg-[#35ef91] hover:shadow-[0_0_22px_rgba(25,216,121,0.38)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-[#2c9e68]/70 bg-[#0b2419]/80 text-[#b8f7d3] shadow-sm hover:border-[#35ef91] hover:bg-[#123b27] hover:text-[#eafff1] hover:shadow-[0_0_16px_rgba(25,216,121,0.2)]",
        secondary:
          "border border-[#245f43]/70 bg-[#103522]/85 text-[#b8f7d3] shadow-sm hover:border-[#35ef91] hover:bg-[#16492d] hover:text-[#eafff1]",
        ghost: "text-[#b8f7d3] hover:bg-[#123b27] hover:text-[#eafff1] hover:shadow-[0_0_14px_rgba(25,216,121,0.18)]",
        link: "text-[#5af2a0] underline-offset-4 hover:text-[#a5ffc9] hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

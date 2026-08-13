import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// The app's one button style system. Use `asChild` to render as an <a>, a router
// Link, or a Popover/Drawer trigger instead of a plain <button>.
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-sm transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        icon: "gap-1.5 border border-border bg-card px-2.5 py-1.5 text-muted-foreground hover:text-foreground",
        outline:
          "gap-2 border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground",
        primary:
          "gap-1.5 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />;
  },
);
Button.displayName = "Button";

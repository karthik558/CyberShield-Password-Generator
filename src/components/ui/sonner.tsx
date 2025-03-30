
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-foreground/80 group-[.toast]:border-none group-[.toast]:hover:bg-secondary group-[.toast]:hover:text-foreground dark:group-[.toast]:text-foreground/90 dark:group-[.toast]:hover:text-foreground",
          error: "group-[.toast]:bg-destructive/15 group-[.toast]:text-destructive group-[.toast]:border-destructive/20 group-[.toast]:dark:bg-destructive/15",
          success: "group-[.toast]:bg-green-500/15 group-[.toast]:text-green-600 group-[.toast]:border-green-500/20 group-[.toast]:dark:bg-green-500/15 group-[.toast]:dark:text-green-400",
          warning: "group-[.toast]:bg-yellow-500/15 group-[.toast]:text-yellow-600 group-[.toast]:border-yellow-500/20 group-[.toast]:dark:bg-yellow-500/15 group-[.toast]:dark:text-yellow-400",
          info: "group-[.toast]:bg-blue-500/15 group-[.toast]:text-blue-600 group-[.toast]:border-blue-500/20 group-[.toast]:dark:bg-blue-500/15 group-[.toast]:dark:text-blue-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

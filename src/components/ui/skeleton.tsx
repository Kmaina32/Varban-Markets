import { cn } from "@/app/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-none bg-[#F3F4F6]", className)}
      {...props}
    />
  )
}

export { Skeleton }

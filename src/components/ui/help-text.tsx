import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip"
import { CircleHelpIcon } from "lucide-react"
import React from "react"

export function HelpText({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type='button'>
          <CircleHelpIcon className="w-[16px] h-[16px] text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[400px] p-4 border border-border bg-white rounded-md leading-[1.25]">
          <p>{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

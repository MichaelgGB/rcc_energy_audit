"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PageHelpProps {
    title: string
    description?: string
    children: React.ReactNode
}

export function PageHelp({ title, description, children }: PageHelpProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8 opacity-70 hover:opacity-100 transition-opacity" title="Page Help & Guide">
                    <HelpCircle className="w-4 h-4" />
                    <span className="sr-only">Help</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-primary" />
                        {title}
                    </DialogTitle>
                    {description && <DialogDescription className="text-base mt-2">{description}</DialogDescription>}
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4 mt-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pb-4">
                        {children}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

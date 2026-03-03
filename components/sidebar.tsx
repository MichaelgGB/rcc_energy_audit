"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, BarChart3, Activity, Lightbulb, Target, Sliders } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Home",
    href: "/",
    icon: Zap,
  },
  {
    title: "Audit",
    href: "/audit",
    icon: BarChart3,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Activity,
  },
  {
    title: "Predictions",
    href: "/predictions",
    icon: Lightbulb,
  },
  {
    title: "Recommendations",
    href: "/recommendations",
    icon: Target,
  },
  {
    title: "Simulations",
    href: "/simulations",
    icon: Sliders,
  },
]

function SidebarNav() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 px-2 py-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="font-bold text-foreground group-data-[collapsible=icon]:hidden">Energy Audit</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export function AppSidebar() {
  return (
    <SidebarProvider>
      <SidebarNav />
    </SidebarProvider>
  )
}

export default SidebarNav
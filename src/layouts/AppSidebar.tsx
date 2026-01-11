import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Layers, Layers2, History, Tags } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useTags } from "@/features/tag"

const mainMenuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/decks", label: "Decks", icon: Layers },
  { path: "/cards", label: "Cards", icon: Layers2 },
  { path: "/tags", label: "Tags", icon: Tags },
  { path: "/import-history", label: "Imports", icon: History },
]

export function AppSidebar() {
  const location = useLocation()
  const { data: tags } = useTags()

  // Show only the first 5 tags in the sidebar for quick access
  const displayTags = tags.slice(0, 5)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="text-lg font-bold">O</span>
            </div>
            <span className="text-lg font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Octii
            </span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className="py-5 px-4"
                    >
                      <Link to={item.path}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {displayTags.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Tags</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {displayTags.map((tag) => (
                  <SidebarMenuItem key={tag.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={tag.name}
                      className="py-4 px-4"
                    >
                      <Link to={`/tags`}>
                        <div
                          className="size-3 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="truncate">{tag.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {tags.length > 5 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="View all tags"
                      className="py-4 px-4 text-muted-foreground"
                    >
                      <Link to="/tags">
                        <span className="text-sm">+{tags.length - 5} more</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

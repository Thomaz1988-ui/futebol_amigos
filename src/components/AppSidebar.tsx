import { useState } from "react";
import { Home, Users, DollarSign, MessageCircle, Settings, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/useSupabaseData";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Jogadores", url: "/jogadores", icon: Users },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Mensagens", url: "/mensagens", icon: MessageCircle },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { profile } = useProfile();

  const isActive = (path: string) => currentPath === path;

  const getNavClasses = (active: boolean) =>
    active 
      ? "bg-primary/20 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-border`}
    >
      <SidebarContent className="bg-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Logo" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div>
                <h2 className="font-bold text-sidebar-foreground">{profile?.team_name || 'FC Manager'}</h2>
                <p className="text-xs text-sidebar-foreground/70">Gestão Financeira</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Logo" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && "Menu Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClasses(isActive)}`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          {!collapsed && (
            <div className="text-center">
              <p className="text-xs text-sidebar-foreground/50">
                © 2025 DEV THOMAZ JEFFERSON
              </p>
              <p className="text-xs text-sidebar-foreground/50">
                Versão 1.0.0
              </p>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
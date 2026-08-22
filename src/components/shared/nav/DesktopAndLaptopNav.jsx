import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  FileWarning,
  LogOut,
  // Moon,
  // Sun,
  UserRound,
} from "lucide-react";

import { Link, NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import NotificationBell from "@/features/notfications/components/NotificationBell";

import SellerBrandNav from "./SellerBrandNav";

import eventraBDLogo from "@/assets/logo/eventra-bd-logo.png";

const getInitial = (user) => {
  const name = user?.full_name || user?.first_name || user?.email || "User";

  return name.charAt(0).toUpperCase();
};

const getUserName = (user) => {
  return user?.full_name || user?.first_name || "My Account";
};

export default function DesktopAndLaptopNav({
  user,
  navItems,
  sellerBrand,
  sellerBrandLoading,
  // onThemeToggle,
  onLogout,
  onViewNotifications,
  onNotificationNavigate,
}) {
  const canReceiveNotifications =
    user?.role === "customer" || user?.role === "seller";

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-border/70 bg-background/90 backdrop-blur-xl lg:block">
      <nav className="mx-auto flex h-16 max-w-400 items-center px-6 xl:px-8">
        {/* Brand */}
        <div className="flex flex-1 items-center">
          <Link
            to="/"
            className="group flex items-center gap-2"
            aria-label="EventraBD home"
          >
            <img
              src={eventraBDLogo}
              alt=""
              className="h-9 w-9 object-contain"
            />

            <span className="text-xl font-bold tracking-tight text-[#9f0712]">
              EventraBD
            </span>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2",
                  "text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex flex-1 items-center justify-end gap-1.5">
          {/* <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="h-9 w-9 rounded-full"
            aria-label="Toggle theme"
          >
            <Sun className="h-4.5 w-4.5 dark:hidden" />
            <Moon className="hidden h-4.5 w-4.5 dark:block" />
          </Button> */}

          {canReceiveNotifications ? (
            <NotificationBell
              userRole={user.role}
              onViewAll={onViewNotifications}
              onNavigate={onNotificationNavigate}
            />
          ) : null}

          {!user ? (
            <div className="ml-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-full px-4"
              >
                <Link to="/login">Login</Link>
              </Button>

              <Button size="sm" asChild className="rounded-full px-5">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-1 flex items-center gap-2 rounded-full p-1 pr-2 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Open account menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user?.profile_image_url}
                      alt={getUserName(user)}
                    />

                    <AvatarFallback>{getInitial(user)}</AvatarFallback>
                  </Avatar>

                  <div className="hidden max-w-32 text-left xl:block">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {getUserName(user)}
                    </p>

                    <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">
                      {user?.role}
                    </p>
                  </div>

                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="truncate text-sm font-semibold">
                      {getUserName(user)}
                    </p>

                    {user?.email ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    to={`/profile/${user.slug}`}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <UserRound className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                {user.role === "customer" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/customer/hire-requests"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <CalendarDays className="h-4 w-4" />
                        My Hire Orders
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        to="/customer/reports"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <FileWarning className="h-4 w-4" />
                        My Reports
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : null}

                {user.role === "seller" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/seller/hire-requests"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <BriefcaseBusiness className="h-4 w-4" />
                        Hire Requests
                      </Link>
                    </DropdownMenuItem>

                    <SellerBrandNav
                      brand={sellerBrand}
                      loading={sellerBrandLoading}
                      variant="dropdown"
                    />
                  </>
                ) : null}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={onLogout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
    </header>
  );
}

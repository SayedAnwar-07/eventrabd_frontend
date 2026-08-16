import {
  BriefcaseBusiness,
  CalendarDays,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  // Moon,
  // Sun,
  UserPlus,
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

const AppNavLink = ({ to, icon, label, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex min-w-0 flex-col items-center justify-center",
          "gap-1 px-1 py-2 transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground active:text-foreground",
        ].join(" ")
      }
    >
      {icon}

      <span className="max-w-19 truncate text-[10px] font-medium">{label}</span>
    </NavLink>
  );
};

export default function MobileAndTabNav({
  user,
  sellerBrand,
  sellerBrandLoading,
  // onThemeToggle,
  onLogout,
  onViewNotifications,
  onNotificationNavigate,
}) {
  const canReceiveNotifications =
    user?.role === "customer" || user?.role === "seller";

  const isSeller = user?.role === "seller";
  const isCustomer = user?.role === "customer";

  const bottomGridClass = isSeller ? "grid-cols-5" : "grid-cols-4";

  return (
    <div className="lg:hidden">
      {/* TOP APP BAR */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-3 sm:px-5">
          {/* Logo */}
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2"
            aria-label="EventraBD home"
          >
            <img
              src={eventraBDLogo}
              alt="EventraBD"
              className="h-8 w-8 shrink-0 object-contain"
            />

            <span className="truncate text-lg font-bold tracking-tight text-[#9f0712] sm:text-xl">
              EventraBD
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
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

            {canReceiveNotifications && (
              <NotificationBell
                userRole={user.role}
                onViewAll={onViewNotifications}
                onNavigate={onNotificationNavigate}
              />
            )}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.profile_image_url}
                        alt={getUserName(user)}
                      />

                      <AvatarFallback className="text-xs">
                        {getInitial(user)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56"
                >
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-semibold">
                      {getUserName(user)}
                    </p>

                    {user?.email && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    )}
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
        </div>
      </header>

      {/* BOTTOM APP NAVIGATION */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur-xl">
        <div
          className={[
            "grid min-h-16",
            bottomGridClass,
            "pb-[max(env(safe-area-inset-bottom),0.25rem)]",
          ].join(" ")}
        >
          <AppNavLink
            to="/"
            end
            label="Home"
            icon={<Home className="h-5 w-5 shrink-0" />}
          />

          <AppNavLink
            to="/contact"
            label="Contact"
            icon={<MessageCircle className="h-5 w-5 shrink-0" />}
          />

          {/* Guest */}
          {!user && (
            <>
              <AppNavLink
                to="/login"
                label="Login"
                icon={<LogIn className="h-5 w-5 shrink-0" />}
              />

              <AppNavLink
                to="/register"
                label="Sign Up"
                icon={<UserPlus className="h-5 w-5 shrink-0" />}
              />
            </>
          )}

          {/* Customer */}
          {isCustomer && (
            <>
              <AppNavLink
                to="/customer/hire-requests"
                label="Orders"
                icon={<CalendarDays className="h-5 w-5 shrink-0" />}
              />

              <AppNavLink
                to={`/profile/${user.slug}`}
                label="Profile"
                icon={<UserRound className="h-5 w-5 shrink-0" />}
              />
            </>
          )}

          {/* Seller */}
          {isSeller && (
            <>
              <AppNavLink
                to="/seller/hire-requests"
                label="Requests"
                icon={<BriefcaseBusiness className="h-5 w-5 shrink-0" />}
              />

              <SellerBrandNav
                brand={sellerBrand}
                loading={sellerBrandLoading}
                variant="app"
              />

              <AppNavLink
                to={`/profile/${user.slug}`}
                label="Profile"
                icon={<UserRound className="h-5 w-5 shrink-0" />}
              />
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

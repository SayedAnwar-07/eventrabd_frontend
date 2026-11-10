import {
  BriefcaseBusiness,
  CalendarDays,
  FileWarning,
  Home,
  LogIn,
  LogOut,
  Sparkles,
  // Moon,
  // Sun,
  Search,
  UserPlus,
  UserRound,
} from "lucide-react";

import { Link, NavLink } from "react-router-dom";

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

import eventraBDLogo from "@/assets/logo/logo.png";
import MobileSearchDialog from "./MobileSearchDialog";
import { useState } from "react";

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
          "gap-1 px-1 py-2 text-white transition-colors",
          isActive
            ? "bg-white/15 text-white"
            : "text-white hover:bg-white/10 hover:text-white active:bg-white/15",
        ].join(" ")
      }
    >
      {icon}

      <span className="max-w-19 truncate text-[10px] font-medium text-white">
        {label}
      </span>
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

  const [searchOpen, setSearchOpen] = useState(false);

  const bottomGridClass =
    isSeller || isCustomer ? "grid-cols-5" : "grid-cols-4";

  return (
    <div className="lg:hidden">
      {/* TOP APP BAR */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background shadow-sm">
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
              className="h-8 shrink-0 object-contain"
            />
          </Link>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              aria-haspopup="dialog"
              className="flex h-8 w-40 items-center gap-2 rounded-md border border-[#E5DDD5] bg-[#F8F5F2] px-3 text-[#756A62] transition-all duration-300 hover:border-[#A68C78] hover:bg-white active:scale-[0.98] sm:w-40"
            >
              <Search className="h-4 w-4 shrink-0" strokeWidth={1.9} />
              <span className="truncate text-xs font-medium">Search...</span>
            </button>

            {/* Existing Notification Bell */}
            {canReceiveNotifications && (
              <NotificationBell
                userRole={user.role}
                onViewAll={onViewNotifications}
                onNavigate={onNotificationNavigate}
              />
            )}

            {/* Existing User Dropdown */}
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

      {/* Search Popup */}
      <MobileSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* BOTTOM APP NAVIGATION */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-theme-color bg-theme-color text-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
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
            icon={<Home className="h-5 w-5 shrink-0 text-white" />}
          />

          <AppNavLink
            to="/services"
            label="Services"
            icon={<Sparkles className="h-5 w-5 shrink-0 text-white" />}
          />

          {/* Guest */}
          {!user && (
            <>
              <AppNavLink
                to="/login"
                label="Login"
                icon={<LogIn className="h-5 w-5 shrink-0 text-white" />}
              />

              <AppNavLink
                to="/register"
                label="Sign Up"
                icon={<UserPlus className="h-5 w-5 shrink-0 text-white" />}
              />
            </>
          )}

          {/* Customer */}
          {isCustomer && (
            <>
              <AppNavLink
                to="/customer/hire-requests"
                label="Orders"
                icon={<CalendarDays className="h-5 w-5 shrink-0 text-white" />}
              />

              <AppNavLink
                to="/customer/reports"
                label="Reports"
                icon={<FileWarning className="h-5 w-5 shrink-0 text-white" />}
              />

              <AppNavLink
                to={`/profile/${user.slug}`}
                label="Profile"
                icon={<UserRound className="h-5 w-5 shrink-0 text-white" />}
              />
            </>
          )}

          {/* Seller */}
          {isSeller && (
            <>
              <AppNavLink
                to="/seller/hire-requests"
                label="Requests"
                icon={
                  <BriefcaseBusiness className="h-5 w-5 shrink-0 text-white" />
                }
              />

              <div className="text-white">
                <SellerBrandNav
                  brand={sellerBrand}
                  loading={sellerBrandLoading}
                  variant="app"
                />
              </div>

              <AppNavLink
                to={`/profile/${user.slug}`}
                label="Profile"
                icon={<UserRound className="h-5 w-5 shrink-0 text-white" />}
              />
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

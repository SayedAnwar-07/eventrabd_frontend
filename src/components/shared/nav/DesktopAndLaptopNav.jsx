import { useState } from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  FileWarning,
  LogOut,
  Search,
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
import MobileSearchDialog from "./MobileSearchDialog";

import eventraBDLogo from "@/assets/logo/logo.png";

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
  const [searchOpen, setSearchOpen] = useState(false);

  const canReceiveNotifications =
    user?.role === "customer" || user?.role === "seller";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-border/70 bg-secondary-custom/90 backdrop-blur-xl lg:block">
        <nav className="mx-auto flex h-16 max-w-400 items-center px-6 xl:px-8">
          {/* Brand */}
          <div className="flex flex-1 items-center">
            <Link
              to="/"
              className="flex items-center gap-1.5"
              aria-label="EventraBD home"
            >
              <img
                src={eventraBDLogo}
                alt="EventraBD"
                className="h-10 object-contain"
              />
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.to}
                asChild
                size="sm"
                variant="ghost"
                className="h-auto rounded-md p-0 hover:bg-transparent"
              >
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    [
                      "rounded-md px-4 py-1.5 mx-1",
                      "text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-theme-color text-white shadow-sm hover:bg-theme-color/90 hover:text-white"
                        : "text-foreground hover:bg-background hover:text-foreground",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              </Button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex flex-1 items-center justify-end gap-1.5">
            {/* Desktop Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
              className="group flex h-9 w-36 shrink-0 items-center gap-2 rounded-md border border-[#E5DDD5] bg-[#FFFCF9] px-3 text-left text-[#756A62] outline-none transition-all duration-200 hover:border-[#A68C78] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#A68C78] xl:w-48 2xl:w-56"
            >
              <Search
                className="h-4 w-4 shrink-0 text-[#9C2135]"
                strokeWidth={1.9}
              />

              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#81756C]">
                Search services or brands...
              </span>
            </button>

            {/* Notification Bell */}
            {canReceiveNotifications ? (
              <NotificationBell
                userRole={user.role}
                onViewAll={onViewNotifications}
                onNavigate={onNotificationNavigate}
              />
            ) : null}

            {/* Guest Actions */}
            {!user ? (
              <div className="ml-2 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="rounded-md px-4"
                >
                  <Link to="/login">Login</Link>
                </Button>

                <Button
                  size="sm"
                  asChild
                  className="rounded-md hover:bg-theme-color/90 px-5"
                >
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

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-60"
                >
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

      {/* Shared Search Dialog */}
      <MobileSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

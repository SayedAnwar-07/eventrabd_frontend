import { useEffect } from "react";
import {
  Moon,
  Sun,
  Menu,
  Calendar,
  UserRound,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { useTheme } from "@/hooks/useTheme";
import { logoutUser } from "@/store/features/auth/authSlice";
import { fetchMyBrand } from "@/store/features/eventPlanner/eventPlannerSlice";

import eventraBDLogo from "../../assets/logo/eventra-bd-logo.png";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { brandDetails } = useSelector((state) => state.eventPlanner);

  useEffect(() => {
    if (user?.role === "seller" && !brandDetails) {
      dispatch(fetchMyBrand());
    }
  }, [dispatch, user?.role, brandDetails]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const myBrandPath = brandDetails?.slug
    ? `/event-planner/brands/${brandDetails.slug}`
    : "/event-planner/brands";

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Contact", to: "/contact" },
  ];

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
    }`;

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={eventraBDLogo} alt="Eventra BD" className="h-8 w-8" />

            <span className="text-2xl font-bold text-[#9f0712]">EventraBD</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
            </Button>

            {!user ? (
              <>
                {/* Desktop guest buttons */}
                <div className="hidden items-center gap-2 sm:flex">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Login</Link>
                  </Button>

                  <Button size="sm" asChild>
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>

                {/* Mobile guest user dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:hidden"
                      aria-label="Open account menu"
                    >
                      <UserRound className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-40 sm:hidden">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/login"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        to="/register"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Logged-in user dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full"
                    aria-label="Open profile menu"
                  >
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage
                        src={user.profile_image_url}
                        alt={user.full_name || "User"}
                      />

                      <AvatarFallback>
                        {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.slug}`}>Profile</Link>
                  </DropdownMenuItem>

                  {user.role === "seller" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/seller/hire-requests">Hire Requests</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to={myBrandPath}>My Brand</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/event-planner/brands/create">
                          Create Brand
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user.role === "customer" && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/customer/hire-requests"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        My Hire Orders
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile navigation sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-64 p-4">
                <div className="mt-8 space-y-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `block text-base font-medium transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-foreground/80 hover:text-primary"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  {user?.role === "customer" && (
                    <NavLink
                      to="/customer/hire-requests"
                      className={({ isActive }) =>
                        `flex items-center gap-2 text-base font-medium transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-foreground/80 hover:text-primary"
                        }`
                      }
                    >
                      <Calendar className="h-4 w-4" />
                      My Hire Orders
                    </NavLink>
                  )}

                  {user?.role === "seller" && (
                    <>
                      <NavLink
                        to="/seller/hire-requests"
                        className={({ isActive }) =>
                          `block text-base font-medium transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-foreground/80 hover:text-primary"
                          }`
                        }
                      >
                        Hire Requests
                      </NavLink>

                      <NavLink
                        to={myBrandPath}
                        className={({ isActive }) =>
                          `block text-base font-medium transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-foreground/80 hover:text-primary"
                          }`
                        }
                      >
                        My Brand
                      </NavLink>

                      <NavLink
                        to="/event-planner/brands/create"
                        className={({ isActive }) =>
                          `block text-base font-medium transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-foreground/80 hover:text-primary"
                          }`
                        }
                      >
                        Create Brand
                      </NavLink>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

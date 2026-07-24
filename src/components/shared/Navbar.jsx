"use client";

import { useEffect } from "react";
import { Moon, Sun, Menu, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/store/features/auth/authSlice";
import { fetchMyBrand } from "@/store/features/eventPlanner/eventPlannerSlice";
import eventraBDLogo from "../../assets/logo/eventra-bd-logo.png";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
    <nav className="fixed top-0 left-0 w-full z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={eventraBDLogo} alt="Eventra BD" className="h-8 w-8" />
            <span className="text-2xl font-bold text-[#9f0712]">EventraBD</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </Button>

            {!user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage
                        src={user.profile_image_url}
                        alt={user.full_name}
                      />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.slug}`}>Profile</Link>
                  </DropdownMenuItem>

                  {user?.role === "seller" && (
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

                  {user?.role === "customer" && (
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
                    className="text-red-500 cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-64 p-4">
                <div className="mt-6 space-y-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="block text-base font-medium"
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  {user?.role === "customer" && (
                    <Link
                      to="/customer/hire-requests"
                      className="flex items-center gap-2 text-base font-medium"
                    >
                      <Calendar className="h-4 w-4" />
                      My Hire Orders
                    </Link>
                  )}

                  {user?.role === "seller" && (
                    <>
                      <Link
                        to="/seller/hire-requests"
                        className="block text-base font-medium"
                      >
                        Hire Requests
                      </Link>

                      <Link
                        to={myBrandPath}
                        className="block text-base font-medium"
                      >
                        My Brand
                      </Link>

                      <Link
                        to="/event-planner/brands/create"
                        className="block text-base font-medium"
                      >
                        Create Brand
                      </Link>
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

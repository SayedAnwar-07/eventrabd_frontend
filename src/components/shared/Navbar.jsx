"use client";

import { Moon, Sun, Menu, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/store/features/auth/authSlice";

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

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">EventraBD</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </Button>

            {/* Auth Section */}
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
                <DropdownMenuTrigger>
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage
                      src={user.profile_image_url}
                      alt={user.full_name}
                    />
                    <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.slug}`}>Profile</Link>
                  </DropdownMenuItem>

                  {user?.role === "seller" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/event-planner/brands">My Brands</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/event-planner/brands/create">
                          Create Brand
                        </Link>
                      </DropdownMenuItem>
                    </>
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

            {/* Mobile Menu */}
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

                  <div className="pt-6 space-y-2">
                    {!user ? (
                      <>
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/login">Login</Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link to="/register">Sign Up</Link>
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full text-red-500"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    )}
                  </div>
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

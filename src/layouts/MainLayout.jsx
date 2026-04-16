import Navbar from "@/components/shared/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Main Content */}
        <main className="pt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background py-6 mt-10">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} EventraBD. All rights reserved.
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;

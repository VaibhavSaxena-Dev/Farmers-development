import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
        <div className="text-center">
          <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
          <p className="mb-2 text-xl text-muted-foreground">Page not found</p>
          <p className="mb-6 text-sm text-muted-foreground">
            The page <code className="rounded bg-muted px-1">{location.pathname}</code> does not exist.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              Return to Home
            </Link>
            <Link to="/medical" className="rounded-lg border border-border px-4 py-2 hover:bg-muted">
              Vet Doctors
            </Link>
            <Link to="/find-vet" className="rounded-lg border border-border px-4 py-2 hover:bg-muted">
              Find Vet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-gray-300">404</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Page Not Found</h1>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search Models
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

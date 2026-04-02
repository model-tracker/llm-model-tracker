import { Outlet } from "react-router";
import { Navigation } from "./Navigation";

export function Root() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navigation />
      <main className="container mx-auto px-4 py-6 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
}

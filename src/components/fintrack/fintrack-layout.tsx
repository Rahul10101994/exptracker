import { BottomNavBar } from "./bottom-nav-bar";

export function FinTrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <main
        className="
          relative
          mx-auto
          flex
          min-h-screen
          max-w-sm
          flex-col
          gap-4
          px-4
          pt-4
          pb-32
        "
      >
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNavBar />
    </div>
  );
}

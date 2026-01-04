
import { BottomNavBar } from './bottom-nav-bar';

export function FinTrackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background">
      <main className="relative mx-auto flex min-h-screen max-w-sm flex-col gap-6 p-4 pb-28">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}

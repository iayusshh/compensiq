import { AppNavbar } from "@/components/layout/navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
      <footer className="mt-4 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-slate-400">
          All submissions are anonymous · CompensIQ does not share individual data
        </div>
      </footer>
    </>
  );
}

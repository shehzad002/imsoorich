import { AdminPanel } from "@/components/AdminPanel";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Admin — ImsooRich Tools",
  robots: "noindex",
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-void">
        <AdminPanel />
      </main>
    </>
  );
}

import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-wrapper">
      <TopNavBar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

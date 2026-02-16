import BottomNav from "@/components/common/BottomNav";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-background px-4">
      {children}
      <BottomNav />
    </main>
  );
}

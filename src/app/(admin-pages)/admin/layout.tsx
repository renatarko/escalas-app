export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center pt-32 pb-12">
      {children}
    </main>
  );
}

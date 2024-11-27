import { ResourceProvider } from "@/hooks/useResources";

export default function VillageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ResourceProvider>
      {children}
    </ResourceProvider>
  );
}

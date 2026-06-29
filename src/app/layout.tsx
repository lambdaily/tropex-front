import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frontend",
  description: "Next.js app deployed with Coolify",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema Anticorrupción Sinaloa",
  description: "Plataforma ciudadana de denuncia anónima contra la corrupción con análisis inteligente de verosimilitud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        {children}
      </body>
    </html>
  );
}

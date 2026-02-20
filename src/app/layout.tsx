

// import "./globals.css";
// import Navbar from "@/components/Navbar";
// import { Toaster } from "sonner";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className="bg-[#e0f2f1]">

//         <Navbar />

//         {children}

//         {/* REQUIRED for toast messages */}
//         <Toaster
//           position="top-right"
//           richColors
//           closeButton
//           duration={3000}
//         />

//       </body>
//     </html>
//   );
// }







import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Klickshare",
  description: "A platform for photographers and users to share memories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-smooth-gradient text-gray-900">
        <Navbar />

        {/* IMPORTANT for layout stretching */}
        <main className="flex-grow">{children}</main>

        {/* <Footer /> */}

        {/* Sonner toaster */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}

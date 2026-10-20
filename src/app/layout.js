import { Noto_Serif_Bengali } from "next/font/google";
import HeadlineTicker from "@/components/headline-ticker";
import { SiteFooter, SiteHeader } from "@/components/news-ui";
import "./globals.css";

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["latin", "bengali"],
  weight: ["400", "700"], // Noto Serif Bengali is not a variable font; specify the weights you need
});

export const metadata = {
  title: {
    default: "Bangla News 24",
    template: "%s | Bangla News 24",
  },
  description: "বাংলাদেশ ও বিশ্বের সর্বশেষ সংবাদ, বিশ্লেষণ ও গুরুত্বপূর্ণ খবর।",
  icons: {
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      data-scroll-behavior="smooth"
      className={`${notoSerifBengali.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <HeadlineTicker />
        <div className="site-main">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
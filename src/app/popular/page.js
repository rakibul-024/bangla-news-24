import Link from "next/link";
import { getMostReadNews } from "@/lib/news";
import { NewsCard, SectionTitle } from "@/components/news-ui";

export const metadata = {
  title: "সর্বাধিক পঠিত",
};

export default async function PopularPage() {
  const articles = await getMostReadNews();

  return (
    <main className="page-container listing-page">
      <div className="breadcrumb">
        <Link href="/">প্রচ্ছদ</Link>
        <span aria-hidden="true">/</span>
        <span>সর্বাধিক পঠিত</span>
      </div>
      <SectionTitle title="সর্বাধিক পঠিত" />
      <div className="news-grid listing-grid">
        {articles.map((article, index) => (
          <div className="ranked-card" key={article.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <NewsCard article={article} showCategory={false} />
          </div>
        ))}
      </div>
    </main>
  );
}

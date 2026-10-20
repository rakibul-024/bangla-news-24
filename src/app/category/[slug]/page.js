import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getCategoryNews } from "@/lib/news";
import { NewsCard, SectionTitle } from "@/components/news-ui";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  return {
    title: category
      ? category.title
      : "বিভাগ",
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const pageParam = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = Math.max(
    1,
    Number.parseInt(typeof pageParam === "string" ? pageParam : "1", 10) || 1,
  );
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) notFound();

  const result = await getCategoryNews(slug, page);

  const title = result.title || category.title;
  const articles = result.data || [];

  return (
    <main className="page-container listing-page">
      <div className="breadcrumb">
        <Link href="/">প্রচ্ছদ</Link>
        <span aria-hidden="true">/</span>
        <span>{title}</span>
      </div>
      <SectionTitle title={title} />
      {articles.length ? (
        <div className="news-grid listing-grid">
          {articles.map((article) => (
            <NewsCard article={article} key={article.id} showCategory={false} />
          ))}
        </div>
      ) : (
        <p className="empty-state">এই বিভাগে এই মুহূর্তে কোনো খবর পাওয়া যায়নি।</p>
      )}
      {result.pageCount > 1 ? (
        <nav className="pagination" aria-label="পৃষ্ঠা নেভিগেশন">
          {page > 1 ? (
            <Link href={`/category/${slug}?page=${page - 1}`}>← আগের পৃষ্ঠা</Link>
          ) : (
            <span />
          )}
          <span>
            পৃষ্ঠা {page} / {result.pageCount}
          </span>
          {page < result.pageCount ? (
            <Link href={`/category/${slug}?page=${page + 1}`}>পরের পৃষ্ঠা →</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </main>
  );
}

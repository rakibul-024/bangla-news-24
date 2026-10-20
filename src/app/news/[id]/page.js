import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getMostReadNews, formatNewsDate } from "@/lib/news";
import { MostReadList } from "@/components/news-ui";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article?.title) notFound();

  return {
    title: article.title,
    description:
      article.text?.slice(0, 160) || `Bangla News 24-এ পড়ুন: ${article.title}`,
  };
}

function ArticleContent({ blocks }) {
  return blocks.map((block, index) => {
    if (block.type === "image" && block.url) {
      return (
        <figure className="article-figure" key={`${block.url}-${index}`}>
          <Image
            src={block.url}
            alt={block.altText || block.caption || ""}
            width={block.width || 1200}
            height={block.height || 675}
            unoptimized
          />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    }

    if (block.type === "text" && block.text) {
      return <p key={`${index}-${block.text.slice(0, 20)}`}>{block.text}</p>;
    }

    if (block.type === "heading" && block.text) {
      return <h2 key={`${index}-${block.text}`}>{block.text}</h2>;
    }

    if (block.type === "quote" && block.text) {
      return <blockquote key={`${index}-${block.text}`}>{block.text}</blockquote>;
    }

    return null;
  });
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const [article, mostRead] = await Promise.all([
    getArticle(id),
    getMostReadNews(),
  ]);

  if (!article?.title) notFound();

  return (
    <main className="page-container article-page">
      <div className="breadcrumb">
        <Link href="/">প্রচ্ছদ</Link>
        <span aria-hidden="true">/</span>
        <span>সংবাদ</span>
      </div>
      <div className="content-layout article-layout">
        <article className="article-content">
          <span className="eyebrow">{article.source || "Bangla News 24"}</span>
          <h1>{article.title}</h1>
          {article.byline?.length ? (
            <p className="article-byline">
              {article.byline
                .map((byline) =>
                  typeof byline === "string" ? byline : byline.name,
                )
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
          {article.firstPublished ? (
            <time className="news-date" dateTime={article.firstPublished}>
              প্রকাশিত: {formatNewsDate(article.firstPublished)}
            </time>
          ) : null}
          {article.imageUrl &&
          !article.body?.some((block) => block.type === "image") ? (
            <figure className="article-figure article-cover">
              <Image
                src={article.imageUrl}
                alt={article.title}
                width={1200}
                height={675}
                priority
                unoptimized
              />
            </figure>
          ) : null}
          {article.text && !article.body?.some((block) => block.type === "text") ? (
            <p className="article-intro">{article.text.slice(0, 400)}</p>
          ) : null}
          <div className="article-body">
            <ArticleContent blocks={article.body || []} />
          </div>
          {article.tags?.length ? (
            <div className="article-tags">
              <strong>ট্যাগ:</strong>
              {article.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
          <p className="source-note">
            এই সংবাদটির মূল সূত্র:{" "}
            <a href={article.sourceUrl || article.link} target="_blank" rel="noreferrer">
              {article.source || "BBC বাংলা"}
            </a>
          </p>
        </article>
        <aside className="sidebar sidebar-panel article-sidebar">
          <h2 className="sidebar-heading">সর্বাধিক পঠিত</h2>
          <MostReadList articles={mostRead.slice(0, 8)} />
        </aside>
      </div>
    </main>
  );
}

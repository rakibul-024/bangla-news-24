import Image from "next/image";
import Link from "next/link";
import AuthNav from "@/components/auth-nav";
import { isAuthConfigured } from "@/lib/auth";
import { formatNewsDate, getArticleId, getArticleSummary } from "@/lib/news";

const primaryLinks = [
  { label: "হোম", href: "/" },
  { label: "রাজনীতি", href: "/category/politics" },
  { label: "বিশ্ব", href: "/category/world" },
  { label: "অর্থনীতি", href: "/category/economy" },
  { label: "স্বাস্থ্য", href: "/category/health" },
  { label: "খেলা", href: "/category/sports" },
  { label: "প্রযুক্তি", href: "/category/technology" },
  { label: "দেখুন", href: "/category/video" },
];

export function SiteHeader() {
  const date = new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "full",
    timeZone: "Asia/Dhaka",
  }).format(new Date());

  return (
    <header className="site-header">
      <div className="page-container masthead">
        <Link className="brand" href="/" aria-label="Bangla News 24 - হোম">
          <Image src="/logo.webp" alt="" width={40} height={40} priority />
          <span>
            <strong>Bangla News 24</strong>
            <small>{date}</small>
          </span>
        </Link>
        <AuthNav enabled={isAuthConfigured()} />
      </div>
      <nav className="main-nav" aria-label="প্রধান নেভিগেশন">
        <div className="page-container nav-scroll">
          {primaryLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <span>© 2026 BanglaBulletin</span>
        <span>Source: BBC Bangla</span>
      </div>
    </footer>
  );
}

export function SectionTitle({ title, href, linkText = "সব খবর দেখুন" }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {href ? (
        <Link href={href}>
          {linkText} <span aria-hidden="true">←</span>
        </Link>
      ) : null}
    </div>
  );
}

export function NewsCard({ article, variant = "standard", showCategory = true }) {
  const id = getArticleId(article);
  if (!id) return null;

  return (
    <article className={`news-card news-card-${variant}`}>
      <Link className="news-image" href={`/news/${id}`}>
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.imageAlt || article.title}
            width={800}
            height={450}
            loading={variant === "lead" ? "eager" : "lazy"}
            unoptimized
          />
        ) : (
          <span className="image-placeholder" aria-hidden="true">
            Bangla News 24
          </span>
        )}
      </Link>
      <div className="news-card-copy">
        {showCategory && article.category ? (
          <span className="eyebrow">{article.category}</span>
        ) : null}
        <h3>
          <Link href={`/news/${id}`}>{article.title}</Link>
        </h3>
        {getArticleSummary(article) ? (
          <p className="news-summary">{getArticleSummary(article)}</p>
        ) : null}
        {article.firstPublished ? (
          <time className="news-date" dateTime={article.firstPublished}>
            {formatNewsDate(article.firstPublished)}
          </time>
        ) : null}
      </div>
    </article>
  );
}

export function MainHeadlineList({ articles }) {
  return (
    <section className="headline-list-panel" aria-label="প্রধান খবর">
      {articles.map((article) => {
        const id = getArticleId(article);
        if (!id) return null;

        return (
          <article className="headline-list-item" key={id}>
            <span className="eyebrow">{article.category || "প্রধান খবর"}</span>
            <h2>
              <Link href={`/news/${id}`}>{article.title}</Link>
            </h2>
          </article>
        );
      })}
    </section>
  );
}

export function MostReadList({ articles }) {
  return (
    <ol className="most-read-list">
      {articles.map((article, index) => {
        const id = getArticleId(article);
        if (!id) return null;

        return (
          <li key={id}>
            <span className="most-read-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Link href={`/news/${id}`}>{article.title}</Link>
          </li>
        );
      })}
    </ol>
  );
}

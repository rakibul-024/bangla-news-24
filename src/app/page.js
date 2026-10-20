import Link from "next/link";
import {
  getCategories,
  getHomepageSections,
  getLatestNews,
  getMostReadNews,
} from "@/lib/news";
import {
  MainHeadlineList,
  MostReadList,
  NewsCard,
  SectionTitle,
} from "@/components/news-ui";

export const metadata = {
  title: "Bangla News 24",
  description: "বাংলাদেশ ও বিশ্বের সর্বশেষ সংবাদ, বিশ্লেষণ ও গুরুত্বপূর্ণ খবর।",
};

export default async function HomePage() {
  const [latestResult, sections, mostRead, categories] = await Promise.all([
    getLatestNews({ limit: 12 }),
    getHomepageSections(),
    getMostReadNews(),
    getCategories(),
  ]);

  const latestNews = latestResult.data;
  const leadStory = latestNews[0];
  const categorySections = sections.filter(
    (section) =>
      ["বাংলাদেশ", "ভারত", "বিশ্ব", "স্বাস্থ্য", "ভিডিও"].includes(
        section.title,
      ) && section.articles?.length,
  );

  return (
    <main>
      <section className="page-container front-page-top">
        {leadStory ? <NewsCard article={leadStory} variant="lead" /> : null}
        <MainHeadlineList articles={latestNews.slice(1, 5)} />
        <aside className="sidebar-panel">
          <SectionTitle title="সর্বাধিক পঠিত" href="/popular" />
          <MostReadList articles={mostRead.slice(0, 10)} />
        </aside>
      </section>

      <div className="page-container home-sections">
        <section className="content-section">
          <SectionTitle title="নির্বাচিত খবর" />
          <div className="news-grid news-grid-three">
            {latestNews.slice(5).map((article) => (
              <NewsCard article={article} key={article.id} />
            ))}
          </div>
        </section>

        {categorySections.map((section) => {
          const category = categories.find(
            (item) => item.title === section.title,
          );

          return (
            <section className="content-section" key={section.title}>
              <SectionTitle
                title={section.title}
                href={category ? `/category/${category.slug}` : undefined}
              />
              <div className="news-grid news-grid-three">
                {section.articles.slice(0, 4).map((article) => (
                  <NewsCard article={article} key={article.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

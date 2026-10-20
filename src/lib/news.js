const API_BASE_URL = "https://news-api-v2.vercel.app";

async function requestApi(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`News API request failed (${response.status}): ${path}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`News API returned an unsuccessful response: ${path}`);
  }

  return result;
}

export async function getCategories() {
  const result = await requestApi("/api/categories");
  return result.data;
}

export async function getLatestNews({ limit = 12, offset = 0, query } = {}) {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  if (query) searchParams.set("q", query);

  const result = await requestApi(`/api/news?${searchParams.toString()}`);
  return result;
}

export async function getHomepageSections() {
  const result = await requestApi("/api/news/sections");
  return result.data;
}

export async function getMostReadNews() {
  const result = await requestApi("/api/news/most-read");
  return result.data;
}

export async function getCategoryNews(slug, page = 1) {
  const result = await requestApi(
    `/api/category/${encodeURIComponent(slug)}?page=${page}`,
  );
  return result;
}

export async function getArticle(id) {
  const result = await requestApi(`/api/article/${encodeURIComponent(id)}`);
  return result.data;
}

export function formatNewsDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(parsedDate);
}

export function getArticleId(article) {
  return article.id || article.link?.split("/").pop();
}

export function getArticleSummary(article) {
  if (typeof article.description === "string") return article.description;
  return "";
}

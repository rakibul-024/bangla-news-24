"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getArticleId } from "@/lib/news";

const refreshInterval = 5 * 60 * 1000;

export default function HeadlineTicker() {
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    let controller;

    async function loadHeadlines() {
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch("/api/news/ticker", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Ticker request failed (${response.status}).`);
        }

        const result = await response.json();
        if (!Array.isArray(result.data)) {
          throw new Error("Ticker API returned invalid headline data.");
        }

        if (active) {
          setArticles(result.data);
          setStatus(result.data.length ? "ready" : "empty");
        }
      } catch (error) {
        if (error.name === "AbortError" || !active) return;
        setStatus("error");
      }
    }

    loadHeadlines();
    const intervalId = window.setInterval(loadHeadlines, refreshInterval);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const headlines = articles
    .map((article) => ({ article, id: getArticleId(article) }))
    .filter(({ id }) => id);

  return (
    <div className="headline-ticker" aria-label="সর্বশেষ শিরোনাম">
      <div className="page-container ticker-inner">
        <span className="ticker-label">সর্বশেষ</span>
        <div className="ticker-window" aria-live="off">
          {headlines.length ? (
            <div className="ticker-track">
              {[0, 1].map((copy) => (
                <div
                  aria-hidden={copy === 1 ? "true" : undefined}
                  className="ticker-group"
                  key={copy}
                >
                  {headlines.map(({ article, id }) => (
                    <Link
                      href={`/news/${id}`}
                      key={`${copy}-${id}`}
                      tabIndex={copy === 1 ? -1 : undefined}
                    >
                      <span className="ticker-title">{article.title}</span>
                      <span aria-hidden="true">•</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <span className="ticker-status" role="status">
              {status === "error"
                ? "সর্বশেষ খবর এখন পাওয়া যাচ্ছে না"
                : status === "empty"
                  ? "নতুন শিরোনাম নেই"
                  : "সর্বশেষ খবর লোড হচ্ছে..."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

import { getAllArticles } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import LibraryTabs from "@/components/portal/library-tabs";
import ArticlesFilters from "@/components/portal/articles-filters";

export default function PortalArticlesPage() {
  const articles = getAllArticles();

  // Extract unique categories for filter tabs
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <>
      <PageHeader
        title="Articles"
        description="Original writing on deal structures, industry analysis, and strategic frameworks for creative professionals."
        count={`${articles.length} ARTICLES`}
        backHref="/dashboard"
        backLabel="Dashboard"
      />
      <LibraryTabs active="articles" />
      <ArticlesFilters articles={articles} categories={categories} />
      <div className="page-footer" />
    </>
  );
}

import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { LoadingState } from "../common/LoadingState";
import { portalApi, type SearchResult } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui-components/card";
import { Input } from "../../ui-components/input";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setHasSearched(true);
    if (!query.trim()) {
      setResults([]);
      setError("검색어를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      setResults(await portalApi.search(query.trim(), 20));
    } catch (err) {
      setError(errorMessage(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>통합 검색</CardTitle>
        <CardDescription>제목과 본문에서 문서를 검색합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
          <Input className="h-9" aria-label="검색어" placeholder="제목과 본문 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button aria-label="검색" disabled={loading} type="submit">
            <Search className="size-4" />
            검색
          </Button>
        </form>
        <div className="mt-4 grid gap-3">
          {loading ? <LoadingState label="검색 중" /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && results.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <div className="divide-y">
                {results.map((result) => (
                  <Link className="block bg-background p-3 transition-colors hover:bg-muted/50" key={result.articleId} to={`/portal/articles/${result.articleId}`}>
                    <div className="font-medium">{result.title}</div>
                    <div className="text-xs text-muted-foreground">{result.folderTitle}</div>
                    <p className="m-0 mt-1 text-sm text-muted-foreground">{result.snippet}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {hasSearched && query.trim() && !loading && !error && results.length === 0 ? <EmptyState message="검색 결과가 없습니다." /> : null}
        </div>
      </CardContent>
    </Card>
  );
}

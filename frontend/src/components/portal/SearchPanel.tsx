import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { portalApi, type SearchResult } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent } from "../../ui-components/card";
import { Input } from "../../ui-components/input";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!query.trim()) {
      setError("검색어를 입력해 주세요.");
      return;
    }
    try {
      setResults(await portalApi.search(query.trim(), 20));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Card>
      <CardContent>
        <form className="flex gap-2" onSubmit={onSubmit}>
          <Input aria-label="검색어" placeholder="제목과 본문 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button aria-label="검색" size="icon" type="submit">
            <Search size={18} />
          </Button>
        </form>
        {error ? <div className="mt-3"><ErrorState message={error} /></div> : null}
        {results.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {results.map((result) => (
              <Link className="rounded-md border border-[var(--border)] p-3 hover:bg-[var(--panel-muted)]" key={result.articleId} to={`/portal/articles/${result.articleId}`}>
                <div className="font-medium">{result.title}</div>
                <div className="text-xs text-[var(--muted)]">{result.folderTitle}</div>
                <p className="m-0 mt-1 text-sm text-[var(--muted)]">{result.snippet}</p>
              </Link>
            ))}
          </div>
        ) : null}
        {query && !error && results.length === 0 ? <div className="mt-3"><EmptyState message="검색 결과가 없습니다." /></div> : null}
      </CardContent>
    </Card>
  );
}

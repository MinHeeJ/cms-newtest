import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { searchPortal } from "../../lib/api/portal";
import { userMessage } from "../../lib/error-messages";
import type { SearchResult } from "../../types/api";
import { Button } from "../../ui-components/button";
import { Input } from "../../ui-components/input";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSearched(true);
    try {
      setResults(await searchPortal(query));
    } catch (err) {
      setResults([]);
      setError(userMessage(err));
    }
  }

  return (
    <section className="grid gap-3">
      <form className="flex gap-2" onSubmit={submit}>
        <Input aria-label="검색어" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="문서 검색" />
        <Button aria-label="검색" size="icon" type="submit">
          <Search size={18} />
        </Button>
      </form>
      {error ? <ErrorState message={error} /> : null}
      {searched && !error && results.length === 0 ? <EmptyState message="검색 결과가 없습니다." /> : null}
      <div className="grid gap-2">
        {results.map((result) => (
          <Link key={result.articleId} className="rounded-md border border-[var(--border)] bg-white p-3 hover:border-[var(--primary)]" to={`/portal/articles/${result.articleId}`}>
            <div className="font-bold">{result.title}</div>
            <p className="mt-1 max-h-11 overflow-hidden text-sm text-slate-600">{result.snippet}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

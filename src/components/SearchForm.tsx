'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('q') || '';
  const [query, setQuery] = useState(currentSearch);

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/?q=${encodeURIComponent(query)}`);
      } else {
        router.push('/');
      }
    },
    [query, router]
  );

  return (
    <form className="search-bar animate-in" onSubmit={handleSearch}>
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="input-field search-input"
        placeholder="Search by name or mobile number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

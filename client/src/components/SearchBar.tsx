import { useEffect, useState } from "react";

type Props = {
  onSearch: (city: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!query.trim()) return;

    const timeout = window.setTimeout(() => {
      onSearch(query.trim());
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="city"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter city..."
        className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white outline-none"
      />
      <button className="px-4 py-2 bg-blue-500 rounded-lg text-white">
        Search
      </button>
    </form>
  );
}
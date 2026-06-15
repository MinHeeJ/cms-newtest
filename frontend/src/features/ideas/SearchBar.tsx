import { Search, X } from "lucide-react";
import { ChangeEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="search-bar">
      <Search size={18} aria-hidden="true" />
      <input value={value} onChange={handleChange} placeholder="아이디어 검색..." aria-label="아이디어 검색" />
      {value ? (
        <button type="button" className="icon-only" onClick={() => onChange("")} aria-label="검색어 지우기">
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}

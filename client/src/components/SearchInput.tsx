import { SearchIcon } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function SearchInput({ value, onChange, placeholder = "Search...", onFocus, onBlur }: SearchInputProps) {
  return (
    <div className="input-wrap opacity-60 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
      <SearchIcon className="input-icon" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="input-with-icon"
        type="text"
      />
    </div>
  );
}
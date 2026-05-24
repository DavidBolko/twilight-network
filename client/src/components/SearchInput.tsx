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
    <div className="group">
      <div className="input text-sm flex items-center gap-2 pl-2 pr-2 p-0 backdrop-blur-md opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
        <SearchIcon className="shrink-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder={placeholder} className="border-0 w-full focus:outline-none bg-transparent" type="text" />
      </div>
    </div>
  );
}

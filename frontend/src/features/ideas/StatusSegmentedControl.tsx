import type { IdeaStatus } from "../../services/api-client";

interface StatusSegmentedControlProps {
  value: IdeaStatus;
  onChange: (status: IdeaStatus) => void;
}

const options: Array<{ value: IdeaStatus; label: string }> = [
  { value: "captured", label: "수집됨" },
  { value: "developing", label: "발전 중" },
  { value: "archived", label: "보관됨" }
];

export function StatusSegmentedControl({ value, onChange }: StatusSegmentedControlProps) {
  return (
    <div className="segmented-control" role="radiogroup" aria-label="아이디어 상태">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? "active" : ""}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

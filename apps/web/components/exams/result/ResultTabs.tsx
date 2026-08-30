interface ResultTabsProps {
  active: "questions" | "answerSheet";
  onChange: (tab: "questions" | "answerSheet") => void;
}

export default function ResultTabs({
  active,
  onChange,
}: ResultTabsProps) {
  const tabs = [
    { key: "questions", label: "Questions" },
    { key: "answerSheet", label: "Answer Sheet" },
  ] as const;

  return (
    <div
      role="tablist"
      aria-label="Result view"
      className="mx-4 mt-3 flex h-10 shrink-0 rounded-full bg-[#DCD9D5] p-1 md:hidden"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 rounded-full px-3 text-[13px] font-semibold transition-all ${
            active === tab.key
              ? "bg-[#30302E] text-white shadow-sm"
              : "text-[#68655F] hover:text-[#3B3935]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
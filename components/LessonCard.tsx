"use client";

interface LessonCardProps {
  lessonNumber: string;
  title: string;
  summary: string;
  tags?: string[];
  onOpen?: () => void;
}

export default function LessonCard({
  lessonNumber,
  title,
  summary,
  tags = [],
  onOpen,
}: LessonCardProps) {
  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-2xl"
      style={{
        backgroundColor: "var(--wrife-surface)",
        border: "1px solid var(--wrife-border)",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--wrife-blue-soft)" }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: "var(--wrife-blue)" }}
          >
            L{lessonNumber}
          </span>
        </div>
        <h3
          className="text-base font-bold leading-snug"
          style={{ color: "var(--wrife-text-main)" }}
        >
          {title}
        </h3>
      </div>

      <p
        className="text-sm leading-relaxed line-clamp-3"
        style={{ color: "var(--wrife-text-muted)" }}
      >
        {summary}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "var(--wrife-blue-soft)",
                color: "var(--wrife-blue)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-auto">
        <button
          onClick={onOpen}
          className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:shadow-md"
          style={{
            backgroundColor: "var(--wrife-yellow)",
            color: "var(--wrife-text-main)",
          }}
        >
          Open teacher page
        </button>
      </div>
    </div>
  );
}

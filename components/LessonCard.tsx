import Link from "next/link";

interface LessonCardProps {
  lessonNumber: string;
  title: string;
  summary: string;
  tags?: string[];
}

export default function LessonCard({
  lessonNumber,
  title,
  summary,
  tags = [],
}: LessonCardProps) {
  return (
    <Link href={`/lesson/${lessonNumber}`}>
      <div
        className="flex flex-col gap-4 p-4 rounded-2xl h-full hover:shadow-lg transition-shadow duration-200"
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
          <div className="flex flex-wrap gap-2 mt-auto">
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
      </div>
    </Link>
  );
}

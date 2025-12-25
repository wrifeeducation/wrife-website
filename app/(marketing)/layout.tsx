export const metadata = {
  title: "WriFe Pilot Programme | Systematic Writing Curriculum",
  description: "Free pilot programme for UK primary schools. Complete 67-lesson writing curriculum aligned with 2024 Curriculum Review. Apply now for Jan-June 2026.",
  keywords: "writing curriculum, primary schools UK, grammar instruction, teacher workload, curriculum review, systematic writing, WriFe",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-gray-900">
      {children}
    </div>
  );
}

"use client";

import React from "react";

interface MetricCardProps {
  label: string;
  value: string;
  tone: "blue" | "yellow" | "green" | "coral";
  icon?: React.ReactNode;
}

const toneColors = {
  blue: "var(--wrife-blue)",
  yellow: "var(--wrife-yellow)",
  green: "#22C55E",
  coral: "#F87171",
};

export default function MetricCard({ label, value, tone, icon }: MetricCardProps) {
  const accentColor = toneColors[tone];

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: "var(--wrife-surface)",
        border: "1px solid var(--wrife-border)",
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-xs mb-1"
            style={{ color: "var(--wrife-text-muted)" }}
          >
            {label}
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: "var(--wrife-text-main)" }}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

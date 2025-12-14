"use client";

interface FormulaDisplayProps {
  formulaNumber: number;
  totalFormulas: number;
  formulaStructure: string;
  labelledExample: string;
  previousSentence?: string;
  newElements: string[];
  hintText?: string;
}

export default function FormulaDisplay({
  formulaNumber,
  totalFormulas,
  formulaStructure,
  labelledExample,
  previousSentence,
  newElements,
  hintText
}: FormulaDisplayProps) {
  const getNewElementLabel = () => {
    if (newElements.length === 0) return '';
    const labels: Record<string, string> = {
      noun: 'NOUN (naming word)',
      verb: 'VERB (action word)',
      determiner: 'DETERMINER (the, a, an, my)',
      adjective: 'ADJECTIVE (describing word)',
      adverb: 'ADVERB (how the action happens)',
      preposition: 'PREPOSITION (where/when)',
      fronted_adverbial: 'FRONTED ADVERBIAL'
    };
    return newElements.map(e => labels[e] || e.toUpperCase()).join(' + ');
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-[var(--wrife-text-main)]">
          Formula {formulaNumber} of {totalFormulas}
        </h3>
        <div className="flex gap-1">
          {Array.from({ length: totalFormulas }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < formulaNumber 
                  ? 'bg-[var(--wrife-blue)]' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-[var(--wrife-blue-soft)] rounded-lg p-4 mb-4">
        <p className="text-sm text-[var(--wrife-text-muted)] mb-1">Formula Structure:</p>
        <p className="font-mono text-[var(--wrife-blue)] font-bold text-lg">
          {formulaStructure}
        </p>
      </div>

      <div className="bg-white border border-[var(--wrife-border)] rounded-lg p-4 mb-4">
        <p className="text-sm text-[var(--wrife-text-muted)] mb-2">Labelled Example:</p>
        <p className="text-[var(--wrife-text-main)] font-medium whitespace-pre-wrap">
          {labelledExample}
        </p>
      </div>

      {previousSentence && formulaNumber > 1 && (
        <div className="bg-[var(--wrife-yellow)] bg-opacity-20 border border-[var(--wrife-yellow)] rounded-lg p-3 mb-4">
          <p className="text-sm text-[var(--wrife-text-muted)]">
            Your Formula {formulaNumber - 1} sentence:
          </p>
          <p className="font-medium text-[var(--wrife-text-main)]">
            {previousSentence}
          </p>
          <p className="text-sm text-[var(--wrife-blue)] mt-2">
            ↓ Now add: <strong>{getNewElementLabel()}</strong>
          </p>
        </div>
      )}

      {hintText && (
        <div className="flex items-start gap-2 text-sm text-[var(--wrife-text-muted)] bg-gray-50 p-3 rounded-lg">
          <span className="text-lg">💡</span>
          <span>{hintText}</span>
        </div>
      )}
    </div>
  );
}

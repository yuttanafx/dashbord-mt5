import { DocumentTemplate } from "@/lib/types";

export default function TemplatePreviewThumb({ template }: { template: DocumentTemplate }) {
  if (template === "simple") {
    return (
      <svg viewBox="0 0 120 160" className="w-full h-full">
        <rect width="120" height="160" fill="#ffffff" />
        <rect x="10" y="12" width="18" height="18" rx="3" fill="#e2e8f0" />
        <rect x="32" y="14" width="36" height="5" rx="1.5" fill="#94a3b8" />
        <rect x="32" y="22" width="26" height="4" rx="1.5" fill="#cbd5e1" />
        <rect x="80" y="14" width="30" height="6" rx="1.5" fill="#0b5fa8" />
        <line x1="10" y1="40" x2="110" y2="40" stroke="#e2e8f0" strokeWidth="1.5" />
        <rect x="10" y="50" width="40" height="4" rx="1" fill="#cbd5e1" />
        <rect x="10" y="58" width="55" height="4" rx="1" fill="#cbd5e1" />
        {[74, 86, 98].map((y) => (
          <g key={y}>
            <rect x="10" y={y} width="60" height="3.5" rx="1" fill="#e2e8f0" />
            <rect x="92" y={y} width="18" height="3.5" rx="1" fill="#e2e8f0" />
          </g>
        ))}
        <line x1="10" y1="114" x2="110" y2="114" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="80" y="120" width="30" height="6" rx="1.5" fill="#1e293b" />
      </svg>
    );
  }

  if (template === "branded") {
    return (
      <svg viewBox="0 0 120 160" className="w-full h-full">
        <rect width="120" height="160" fill="#ffffff" />
        <rect width="120" height="38" fill="#0b5fa8" />
        <circle cx="22" cy="19" r="10" fill="#ffffff" fillOpacity="0.25" />
        <rect x="38" y="14" width="38" height="5" rx="1.5" fill="#ffffff" />
        <rect x="38" y="22" width="26" height="4" rx="1.5" fill="#ffffff" fillOpacity="0.7" />
        <rect x="10" y="50" width="40" height="4" rx="1" fill="#cbd5e1" />
        <rect x="10" y="58" width="55" height="4" rx="1" fill="#cbd5e1" />
        {[74, 86, 98].map((y) => (
          <g key={y}>
            <rect x="10" y={y} width="60" height="3.5" rx="1" fill="#e2e8f0" />
            <rect x="92" y={y} width="18" height="3.5" rx="1" fill="#e2e8f0" />
          </g>
        ))}
        <rect x="10" y="118" width="100" height="16" rx="3" fill="#e8f1fa" />
        <rect x="80" y="122" width="22" height="7" rx="1.5" fill="#0b5fa8" />
      </svg>
    );
  }

  // detailed
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#ffffff" />
      <rect x="10" y="10" width="18" height="18" rx="3" fill="#e2e8f0" />
      <rect x="32" y="12" width="34" height="5" rx="1.5" fill="#94a3b8" />
      <rect x="32" y="20" width="24" height="4" rx="1.5" fill="#cbd5e1" />
      <rect x="78" y="12" width="32" height="6" rx="1.5" fill="#0b5fa8" />
      <rect
        x="10"
        y="40"
        width="100"
        height="78"
        rx="2"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.2"
      />
      <rect x="10" y="40" width="100" height="12" fill="#f1f5f9" />
      <line x1="10" y1="52" x2="110" y2="52" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="24" y1="40" x2="24" y2="118" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="86" y1="40" x2="86" y2="118" stroke="#cbd5e1" strokeWidth="1" />
      {[60, 72, 84, 96, 108].map((y) => (
        <line key={y} x1="10" y1={y} x2="110" y2={y} stroke="#e2e8f0" strokeWidth="0.8" />
      ))}
      <rect x="78" y="128" width="32" height="7" rx="1.5" fill="#1e293b" />
    </svg>
  );
}

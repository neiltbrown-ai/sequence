"use client";

interface CollapsedResponseProps {
  label: string;
  toolName: string;
}

/**
 * Shown in place of a structured component after the user has interacted.
 * Displays their selection as a compact label.
 */
export default function CollapsedResponse({
  label,
  toolName,
}: CollapsedResponseProps) {
  return (
    <div className="adv-comp-collapsed" data-tool={toolName}>
      <span className="adv-comp-collapsed-label">{label}</span>
    </div>
  );
}

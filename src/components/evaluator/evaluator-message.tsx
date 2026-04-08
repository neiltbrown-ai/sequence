'use client';

import type { EvalChatMessage, EvalComponentType } from '@/lib/evaluator/evaluator-state-machine';
import { resolveStructureSlug } from '@/lib/structure-slugs';
import ChatOptionCards from '@/components/advisor/components/option-cards';
import ChatMultiSelect from '@/components/advisor/components/multi-select-cards';
import ChatFreeTextInline from '@/components/advisor/components/free-text-inline';
import ChatCurrencyInput from '@/components/advisor/components/currency-input';
import { PercentageInput } from './components/percentage-input';
import { NumberInput } from './components/number-input';
import { VerdictSummary } from './components/verdict-summary';
import { RadarChart } from './components/radar-chart';
import { DimensionCards } from './components/dimension-card';

interface EvalMessageProps {
  message: EvalChatMessage;
  isLast: boolean;
  onSelect: (questionId: string, value: unknown, label: string) => void;
}

function formatLabel(value: unknown, options?: { value: string; label: string }[]): string {
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        const opt = options?.find((o) => o.value === v);
        return opt?.label ?? String(v);
      })
      .join(', ');
  }
  if (options) {
    const opt = options.find((o) => o.value === String(value));
    if (opt) return opt.label;
  }
  if (typeof value === 'number') return String(value);
  return String(value ?? '');
}

function formatCurrency(val: unknown): string {
  const num = parseFloat(String(val));
  if (isNaN(num)) return String(val);
  return '$' + num.toLocaleString('en-US');
}

export function EvalMessage({ message, isLast, onSelect }: EvalMessageProps) {
  // Thinking dots
  if (message.isThinking) {
    return (
      <div className="eval-message eval-message-assistant">
        <div className="adv-thinking-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  // User collapsed label
  if (message.role === 'user' && message.collapsedLabel) {
    return (
      <div className="eval-message eval-message-user">
        <div className="adv-msg-collapsed">{message.collapsedLabel}</div>
      </div>
    );
  }

  // Assistant message
  if (message.role === 'assistant') {
    const comp = message.component;
    const disabled = !isLast;

    return (
      <div className="eval-message eval-message-assistant">
        {message.text && (
          <div className="eval-message-text">
            {renderText(message.text, message.boldLastLine)}
          </div>
        )}
        {comp && renderComponent(comp.type, comp.questionId, comp.props, disabled, onSelect)}
      </div>
    );
  }

  return null;
}

function renderText(text: string, boldLastLine?: boolean) {
  const lines = text.split('\n');
  if (!boldLastLine || lines.length <= 1) {
    return lines.map((line, i) => (
      <p key={i} className={line === '' ? 'eval-text-break' : undefined}>
        {line}
      </p>
    ));
  }

  const last = lines.length - 1;
  return lines.map((line, i) => (
    <p key={i} className={line === '' ? 'eval-text-break' : undefined}>
      {i === last ? <strong>{line}</strong> : line}
    </p>
  ));
}

function renderComponent(
  type: EvalComponentType,
  questionId: string,
  props: Record<string, unknown>,
  disabled: boolean,
  onSelect: (questionId: string, value: unknown, label: string) => void,
) {
  const options = props.options as { value: string; label: string; description?: string }[] | undefined;

  switch (type) {
    case 'option_cards':
    case 'deal_type_cards':
      return (
        <ChatOptionCards
          questionId={questionId}
          questionText={props.questionText as string}
          options={options ?? []}
          onSelect={(val) => onSelect(questionId, val, formatLabel(val, options))}
          disabled={disabled}
        />
      );

    case 'multi_select':
      return (
        <ChatMultiSelect
          questionId={questionId}
          questionText={props.questionText as string}
          options={options ?? []}
          onSelect={(val) => onSelect(questionId, val, formatLabel(val, options))}
          disabled={disabled}
        />
      );

    case 'free_text':
      return (
        <ChatFreeTextInline
          questionId={questionId}
          questionText={props.questionText as string}
          onSelect={(val) => onSelect(questionId, val, String(val))}
          disabled={disabled}
          placeholder={props.placeholder as string}
        />
      );

    case 'currency_input':
      return (
        <ChatCurrencyInput
          questionId={questionId}
          questionText={props.questionText as string}
          onSelect={(val) => onSelect(questionId, val, formatCurrency(val))}
          disabled={disabled}
        />
      );

    case 'percentage_input':
      return (
        <PercentageInput
          questionId={questionId}
          onSelect={(val) => onSelect(questionId, val, `${val}%`)}
          disabled={disabled}
          prefillValue={props.prefillValue as number | undefined}
          prefillLabel={props.prefillLabel as string | undefined}
        />
      );

    case 'number_input':
      return (
        <NumberInput
          questionId={questionId}
          onSelect={(val) => onSelect(questionId, val, String(val))}
          disabled={disabled}
          placeholder={props.placeholder as string}
        />
      );

    case 'verdict_summary':
      return (
        <VerdictSummary
          signal={props.signal as 'green' | 'yellow' | 'red'}
          score={props.score as number}
          headline={props.headline as string}
          summary={props.summary as string}
        />
      );

    case 'radar_chart':
      return (
        <RadarChart
          dimensions={props.dimensions as { key: string; label: string; score: number; signal: 'green' | 'yellow' | 'red' }[]}
        />
      );

    case 'dimension_cards':
      return (
        <DimensionCards
          dimensions={props.dimensions as { key: string; label: string; description: string; score: number; signal: 'green' | 'yellow' | 'red'; flags: string[]; summary: string }[]}
          redFlags={props.redFlags as { id: string; message: string; questionId: string }[]}
        />
      );

    case 'misalignment_warnings': {
      const warnings = props.warnings as { flag: string; warning: string; structureRef?: { id: number; slug: string } }[];
      return (
        <div className="eval-misalignment-warnings">
          {warnings.map((w, i) => (
            <div key={i} className="eval-misalignment-card">
              <span className="eval-misalignment-icon">⚠</span>
              <p>{w.warning}</p>
              {w.structureRef && (
                <a href={`/library/structures/${resolveStructureSlug(w.structureRef.slug)}`} className="eval-misalignment-link">
                  View structure →
                </a>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'roadmap_alignment': {
      const alignment = props.alignment as {
        stageAlignment: string;
        stageMessage: string;
        flagConnection?: { flag: string; addresses: boolean; message: string };
        actionConnection?: { actionOrder: number; title: string; message: string };
      };
      return (
        <div className="eval-roadmap-alignment">
          <div className={`eval-alignment-stage eval-align-${alignment.stageAlignment}`}>
            <p>{alignment.stageMessage}</p>
          </div>
          {alignment.flagConnection && (
            <div className={`eval-alignment-flag ${alignment.flagConnection.addresses ? 'is-positive' : 'is-negative'}`}>
              <p>{alignment.flagConnection.message}</p>
            </div>
          )}
          {alignment.actionConnection && (
            <div className="eval-alignment-action">
              <p>{alignment.actionConnection.message}</p>
              <a href="/roadmap" className="eval-alignment-link">View your Roadmap →</a>
            </div>
          )}
        </div>
      );
    }

    case 'recommended_actions': {
      const actions = props.actions as {
        order: number;
        action: string;
        detail: string;
        structure_ref?: { id: number; slug: string; title: string };
      }[];
      return (
        <div className="eval-actions-list">
          {actions.map((a) => (
            <div key={a.order} className="eval-action-item">
              <span className="eval-action-number">{a.order}</span>
              <div>
                <strong>{a.action}</strong>
                <p>{a.detail}</p>
                {a.structure_ref && (
                  <a href={`/library/structures/${resolveStructureSlug(a.structure_ref.slug)}`} className="eval-action-link">
                    {a.structure_ref.title} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'library_resources': {
      const resources = props.resources as {
        structures: { id: number; slug: string; title: string; why: string }[];
        case_studies: { slug: string; title: string; why: string }[];
      };
      return (
        <div className="eval-resources">
          {resources.structures.length > 0 && (
            <div className="eval-resources-section">
              <h5>Structures</h5>
              {resources.structures.map((s) => (
                <a key={s.id} href={`/library/structures/${resolveStructureSlug(s.slug)}`} className="eval-resource-link">
                  <span>{s.title}</span>
                  <span className="eval-resource-why">{s.why}</span>
                </a>
              ))}
            </div>
          )}
          {resources.case_studies.length > 0 && (
            <div className="eval-resources-section">
              <h5>Case Studies</h5>
              {resources.case_studies.map((cs) => (
                <a key={cs.slug} href={`/library/case-studies/${cs.slug}`} className="eval-resource-link">
                  <span>{cs.title}</span>
                  <span className="eval-resource-why">{cs.why}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

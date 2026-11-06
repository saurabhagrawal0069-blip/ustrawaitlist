import { messages, type MessageKey } from '@/lib/messages';

type Params = Record<string, string | number>;

function fill(text: string, params?: Params): string {
  if (!params) return text;
  let out = text;
  for (const [name, value] of Object.entries(params)) out = out.replace(`{${name}}`, String(value));
  return out;
}

/**
 * The English text, with the same text in Hindi on the line underneath, so both show on the page at once.
 * Use `inline` inside buttons and chips, where the Hindi goes on the same line after a dot.
 */
export function Bi({ k, params, inline = false }: { k: MessageKey; params?: Params; inline?: boolean }) {
  const en = fill(messages.en[k], params);
  const hi = fill(messages.hi[k], params);
  // Some names are the same in both languages (shop names, for example). Show them once.
  if (en === hi) return <>{en}</>;
  return inline ? (
    <>{en} <span className="hi-inline" lang="hi">· {hi}</span></>
  ) : (
    <>{en}<span className="hi-line" lang="hi">{hi}</span></>
  );
}

/** Both languages as one plain string, for placeholders, option labels and aria labels. */
export function pair(k: MessageKey, params?: Params): string {
  const en = fill(messages.en[k], params);
  const hi = fill(messages.hi[k], params);
  return en === hi ? en : `${en} / ${hi}`;
}

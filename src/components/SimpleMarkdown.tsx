import Link from 'next/link';
import type { ReactNode } from 'react';

// Минимальный рендер Markdown для юридических страниц: заголовки ##, абзацы, списки «- »,
// таблицы «| … |», **жирный** и [ссылки](url). Без внешних зависимостей.

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1]) out.push(<b key={key}>{m[1]}</b>);
    else if (m[3].startsWith('/')) out.push(<Link key={key} href={m[3]} className="underline">{m[2]}</Link>);
    else out.push(<a key={key} href={m[3]} className="underline" target="_blank" rel="noopener noreferrer">{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export default function SimpleMarkdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/);
  return (
    <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-7">
      {blocks.map((block, bi) => {
        const lines = block.split('\n');
        const key = `b${bi}`;
        if (block.startsWith('## ')) {
          return <h2 key={key} className="text-lg font-bold text-gray-900 pt-2">{block.slice(3)}</h2>;
        }
        if (lines.every((l) => l.trim().startsWith('|'))) {
          const [head, , ...rows] = lines;
          return (
            <div key={key} className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>{cells(head).map((c, i) => <th key={i} className="text-left p-2 border-b border-gray-200">{inline(c, `${key}h${i}`)}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r, ri) => (
                    <tr key={ri} className="border-b border-gray-100 align-top">
                      {cells(r).map((c, ci) => <td key={ci} className="p-2">{inline(c, `${key}r${ri}c${ci}`)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={key} className="list-disc pl-5 space-y-1.5">
              {lines.map((l, li) => <li key={li}>{inline(l.slice(2), `${key}l${li}`)}</li>)}
            </ul>
          );
        }
        return <p key={key}>{inline(lines.join(' '), key)}</p>;
      })}
    </div>
  );
}

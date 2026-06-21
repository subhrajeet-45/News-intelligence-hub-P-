import React from 'react';
import { 
  FileText, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Code
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Function to process inline styling: bold and italic
  const renderInlineStyles = (text: string) => {
    // Process bold (**text**)
    let html = text;
    const boldRegex = /\*\*(.*?)\*\*/g;
    html = html.replace(boldRegex, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
    
    // Process italic (*text*)
    const italicRegex = /\*(.*?)\*/g;
    html = html.replace(italicRegex, '<em class="italic text-slate-850 dark:text-slate-200">$1</em>');

    // Process inline code (`code`)
    const inlineCodeRegex = /`(.*?)`/g;
    html = html.replace(inlineCodeRegex, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-600 dark:text-indigo-400">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Split lines
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let inList = false;
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLanguage = '';
  
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="space-y-2.5 my-3.5 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-slate-650 dark:text-slate-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <div>{renderInlineStyles(item)}</div>
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushCodeBlock = (key: string) => {
    if (codeBlockLines.length > 0) {
      renderedElements.push(
        <div key={`code-${key}`} className="my-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs shadow-md">
          {codeLanguage && (
            <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <Code className="w-3.5 h-3.5" />
                {codeLanguage}
              </span>
              <span>Copy</span>
            </div>
          )}
          <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        </div>
      );
      codeBlockLines = [];
      inCodeBlock = false;
      codeLanguage = '';
    }
  };

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      // Find clean headers (row 0)
      const headers = tableRows[0];
      const dataRows = tableRows.slice(1).filter(r => r.length > 0 && r.some(cell => cell.trim().replace(/-+/g, '') !== ''));
      
      renderedElements.push(
        <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-805/80 max-w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-805">
                {headers.map((h, idx) => (
                  <th key={idx} className="px-4 py-3 font-semibold text-slate-850 dark:text-slate-200">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-650 dark:text-slate-350">
                      {renderInlineStyles(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code block handling
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(`${i}`);
      } else {
        flushList(`${i}`);
        flushTable(`${i}`);
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim() || 'code';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // 2. Table handling
    if (trimmed.startsWith('|')) {
      flushList(`${i}`);
      inTable = true;
      // Parse columns
      const cols = line.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      // Skip if it is a separator line (contains only dashes or spaces)
      const isSeparator = cols.every(c => c.replace(/-+/g, '') === '');
      if (!isSeparator) {
        tableRows.push(cols);
      }
      continue;
    } else {
      if (inTable && !trimmed.startsWith('|')) {
        flushTable(`${i}`);
      }
    }

    // 3. Header handling
    if (trimmed.startsWith('#')) {
      flushList(`${i}`);
      flushTable(`${i}`);
      
      const level = line.indexOf(' ') !== -1 ? line.indexOf(' ') : line.length;
      const hText = line.substring(level).trim();
      
      if (level === 1) {
        renderedElements.push(
          <h1 key={`h1-${i}`} className="text-[32px] md:text-[36px] font-sans font-bold text-slate-905 dark:text-white tracking-tight mt-6 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            {renderInlineStyles(hText)}
          </h1>
        );
      } else if (level === 2) {
        renderedElements.push(
          <h2 key={`h2-${i}`} className="text-[24px] md:text-[28px] font-sans font-semibold text-slate-900 dark:text-white mt-5 mb-2.5">
            {renderInlineStyles(hText)}
          </h2>
        );
      } else {
        renderedElements.push(
          <h3 key={`h3-${i}`} className="text-[19px] md:text-[22px] font-sans font-semibold text-slate-850 dark:text-white mt-4 mb-2">
            {renderInlineStyles(hText)}
          </h3>
        );
      }
      continue;
    }

    // 4. Bullet list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      continue;
    } else if (trimmed.match(/^\d+\.\s/)) {
      // Numbered list
      flushList(`${i}`);
      const itemText = trimmed.replace(/^\d+\.\s/, '');
      renderedElements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-2.5 text-[14px] leading-relaxed text-slate-655 dark:text-slate-300 pl-1">
          <span className="font-mono text-xs text-indigo-500 font-bold mt-1 shrink-0 bg-indigo-50 dark:bg-indigo-950/40 w-5 h-5 rounded-md flex items-center justify-center">
            {trimmed.match(/^\d+/)?.[0]}.
          </span>
          <div className="flex-1 mt-0.5">{renderInlineStyles(itemText)}</div>
        </div>
      );
      continue;
    } else {
      if (inList) {
        flushList(`${i}`);
      }
    }

    // 5. Blockquote handling
    if (trimmed.startsWith('>')) {
      flushList(`${i}`);
      flushTable(`${i}`);
      const quoteText = trimmed.slice(1).trim();
      renderedElements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-indigo-500 bg-slate-50 dark:bg-slate-950/30 pl-4 py-2.5 pr-2 my-4 rounded-r-xl italic text-slate-650 dark:text-slate-350 text-[14.5px]">
          {renderInlineStyles(quoteText)}
        </blockquote>
      );
      continue;
    }

    // 6. Section Auto-Formater or standard paragraphs
    if (trimmed) {
      flushList(`${i}`);
      flushTable(`${i}`);

      const upperTrimmed = trimmed.toUpperCase();
      
      // Check if this acts as a section header like SUMMARY:, KEY INSIGHTS:, etc.
      let matchedSection = null;
      let title = "";
      let icon = null;
      let colorClass = "";
      let bgClass = "";
      
      if (upperTrimmed.startsWith('SUMMARY') || upperTrimmed.startsWith('**SUMMARY**')) {
        matchedSection = "Summary";
        title = "Summary";
        icon = <FileText className="w-4 h-4 text-blue-500" />;
        colorClass = "border-blue-200/60 dark:border-blue-900/40";
        bgClass = "bg-blue-50/5 dark:bg-blue-950/10";
      } else if (upperTrimmed.startsWith('KEY INSIGHTS') || upperTrimmed.startsWith('**KEY INSIGHTS**')) {
        matchedSection = "Key Insights";
        title = "Key Insights";
        icon = <Lightbulb className="w-4 h-4 text-emerald-500" />;
        colorClass = "border-emerald-200/60 dark:border-emerald-900/40";
        bgClass = "bg-emerald-50/5 dark:bg-emerald-950/10";
      } else if (upperTrimmed.startsWith('ECONOMIC IMPACT') || upperTrimmed.startsWith('**ECONOMIC IMPACT**')) {
        matchedSection = "Economic Impact";
        title = "Economic Impact";
        icon = <TrendingUp className="w-4 h-4 text-indigo-500" />;
        colorClass = "border-indigo-200/60 dark:border-indigo-900/40";
        bgClass = "bg-indigo-50/5 dark:bg-indigo-950/10";
      } else if (upperTrimmed.startsWith('RISKS') || upperTrimmed.startsWith('**RISKS**')) {
        matchedSection = "Risks";
        title = "Risks";
        icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
        colorClass = "border-amber-200/60 dark:border-amber-900/40";
        bgClass = "bg-amber-50/5 dark:bg-amber-955/10";
      } else if (upperTrimmed.startsWith('RECOMMENDATIONS') || upperTrimmed.startsWith('**RECOMMENDATIONS**')) {
        matchedSection = "Recommendations";
        title = "Recommendations";
        icon = <CheckCircle className="w-4 h-4 text-purple-500" />;
        colorClass = "border-purple-200/60 dark:border-purple-900/40";
        bgClass = "bg-purple-50/5 dark:bg-purple-950/10";
      }

      if (matchedSection) {
        // Strip out redundant section starters from body text
        const bodyContent = trimmed.replace(/^(SUMMARY|KEY INSIGHTS|ECONOMIC IMPACT|RISKS|RECOMMENDATIONS)?\s*[:\-\s*]*/i, '').trim();
        renderedElements.push(
          <div key={`section-${i}`} className={`my-4.5 p-5 border rounded-[16px] ${colorClass} ${bgClass} shadow-xs space-y-2`}>
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-md">
              {icon}
              <span>{title}</span>
            </div>
            <p className="text-[14.5px] leading-relaxed text-slate-655 dark:text-slate-300 font-sans">
              {renderInlineStyles(bodyContent)}
            </p>
          </div>
        );
      } else {
        // Normal paragraph
        renderedElements.push(
          <p key={`p-${i}`} className="text-[14.5px] leading-relaxed text-slate-655 dark:text-slate-300 font-sans mb-3.5">
            {renderInlineStyles(trimmed)}
          </p>
        );
      }
    }
  }

  // Cleanup remaining
  if (inList) flushList('end');
  if (inCodeBlock) flushCodeBlock('end');
  if (inTable) flushTable('end');

  return (
    <div className="space-y-1.5 overflow-hidden">
      {renderedElements}
    </div>
  );
}

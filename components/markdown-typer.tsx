// MarkdownTypewriter.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Types and Interfaces
interface CursorStyle {
  shape: 'block' | 'line' | 'underscore' | 'custom';
  customContent?: string;
  width?: string;
  height?: string;
  color?: string;
  blinkSpeed?: number;
}

interface MarkdownTypewriterProps {
  content: string;
  typeSpeed?: number;
  initialDelay?: number;
  onComplete?: () => void;
  className?: string;
  cursor?: CursorStyle | false;
}

interface Segment {
  type: 'text' | 'html';
  content: string;
  length: number;
}

interface TypewriterState {
  segments: Segment[];
  currentSegmentIndex: number;
  currentCharIndex: number;
  isStarted: boolean;
  showCursor: boolean;
}

// Predefined cursor styles
export const cursorPresets: Record<string, CursorStyle> = {
  block: {
    shape: 'block',
    width: 'w-2',
    height: 'h-4',
    color: 'bg-black',
    blinkSpeed: 530
  },
  line: {
    shape: 'line',
    width: 'w-0.5',
    height: 'h-4',
    color: 'bg-black',
    blinkSpeed: 530
  },
  underscore: {
    shape: 'underscore',
    width: 'w-2',
    height: 'h-0.5',
    color: 'bg-black',
    blinkSpeed: 530
  }
};

// Markdown processing rules
interface MarkdownRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
}

const markdownRules: MarkdownRule[] = [
  {
    // Headers
    pattern: /^(#{1,6})\s(.+)$/gm,
    replacement: (match: string, hashes: string, content: string) => {
      const level = hashes.length;
      const size = {
        1: 'text-4xl',
        2: 'text-3xl',
        3: 'text-2xl',
        4: 'text-xl',
        5: 'text-lg',
        6: 'text-base'
      }[level as 1|2|3|4|5|6] || 'text-base';
      return `<h${level} class="font-bold ${size} mb-4">${content}</h${level}>`;
    }
  },
  {
    // Bold
    pattern: /\*\*(.*?)\*\*/g,
    replacement: '<strong>$1</strong>'
  },
  {
    // Italic
    pattern: /\*(.*?)\*/g,
    replacement: '<em>$1</em>'
  },
  {
    // Code blocks
    pattern: /```([\s\S]*?)```/g,
    replacement: (match: string, code: string) => 
      `<pre class="bg-gray-100 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto">${code.trim()}</pre>`
  },
  {
    // Inline code
    pattern: /`([^`]+)`/g,
    replacement: '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>'
  },
  {
    // Blockquotes
    pattern: /^>\s(.+)$/gm,
    replacement: '<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-4 italic">$1</blockquote>'
  },
  {
    // Lists
    pattern: /^[-*]\s(.+)$/gm,
    replacement: '<li class="ml-4">$1</li>'
  },
  {
    // Links
    pattern: /\[(.*?)\]\((.*?)\)/g,
    replacement: '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
  },
  {
    // Line breaks
    pattern: /\n/g,
    replacement: '<br>'
  }
];

// Cursor Component
const Cursor: React.FC<{ style: CursorStyle; visible: boolean }> = ({ 
  style, 
  visible 
}) => {
  if (style.shape === 'custom' && style.customContent) {
    return (
      <span 
        className={`inline-block ml-1 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          transition: `opacity ${style.blinkSpeed || 530}ms`,
          color: style.color?.replace('bg-', 'text-') || 'text-black'
        }}
      >
        {style.customContent}
      </span>
    );
  }

  const cursorClass = `
    inline-block ml-1
    ${style.width || 'w-2'}
    ${style.height || 'h-4'}
    ${style.color || 'bg-black'}
    ${visible ? 'opacity-100' : 'opacity-0'}
  `.trim();

  return <span className={cursorClass} aria-hidden="true" />;
};

// Utility functions
const mergeCursorStyles = (customStyle: Partial<CursorStyle>): CursorStyle => {
  const baseStyle = cursorPresets[customStyle.shape || 'block'];
  return { ...baseStyle, ...customStyle };
};

const processMarkdown = (text: string): string => {
  let processed = text;
  markdownRules.forEach(rule => {
    processed = processed.replace(rule.pattern, rule.replacement as string);
  });
  return processed;
};

// Main Component
const MarkdownTypewriter: React.FC<MarkdownTypewriterProps> = ({
  content,
  typeSpeed = 50,
  initialDelay = 500,
  onComplete,
  className = '',
  cursor = cursorPresets.block
}) => {
  const [state, setState] = useState<TypewriterState>({
    segments: [],
    currentSegmentIndex: 0,
    currentCharIndex: 0,
    isStarted: false,
    showCursor: true
  });

  const processContent = useCallback((markdown: string): Segment[] => {
    const processed = processMarkdown(markdown);
    const segments: Segment[] = [];
    const tagRegex = /<[^>]+>/g;
    let match;
    let lastIndex = 0;

    while ((match = tagRegex.exec(processed)) !== null) {
      if (match.index > lastIndex) {
        const textContent = processed.slice(lastIndex, match.index);
        if (textContent) {
          segments.push({
            type: 'text',
            content: textContent,
            length: textContent.length
          });
        }
      }

      segments.push({
        type: 'html',
        content: match[0],
        length: 1
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < processed.length) {
      segments.push({
        type: 'text',
        content: processed.slice(lastIndex),
        length: processed.length - lastIndex
      });
    }

    return segments;
  }, []);

  useEffect(() => {
    const processedSegments = processContent(content);
    setState(prev => ({
      ...prev,
      segments: processedSegments
    }));
  }, [content, processContent]);

  useEffect(() => {
    if (state.segments.length === 0) return;

    const startTimeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isStarted: true
      }));
    }, initialDelay);

    return () => clearTimeout(startTimeout);
  }, [state.segments, initialDelay]);

  useEffect(() => {
    if (!state.isStarted || state.segments.length === 0) return;

    const currentSegment = state.segments[state.currentSegmentIndex];
    if (!currentSegment) return;

    const isLastSegment = state.currentSegmentIndex === state.segments.length - 1;
    const isSegmentComplete = state.currentCharIndex >= currentSegment.length;

    if (isSegmentComplete) {
      if (isLastSegment) {
        onComplete?.();
        return;
      }

      const timeout = setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentSegmentIndex: prev.currentSegmentIndex + 1,
          currentCharIndex: 0
        }));
      }, typeSpeed);

      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentCharIndex: prev.currentCharIndex + 1
      }));
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [state, typeSpeed, onComplete]);

  useEffect(() => {
    if (!cursor) return;
    
    const cursorStyle = typeof cursor === 'object' ? mergeCursorStyles(cursor) : cursorPresets.block;
    const blinkSpeed = cursorStyle.blinkSpeed || 530;

    const cursorInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        showCursor: !prev.showCursor
      }));
    }, blinkSpeed);

    return () => clearInterval(cursorInterval);
  }, [cursor]);

  const renderContent = useMemo(() => {
    return state.segments.map((segment, segmentIndex) => {
      if (segmentIndex > state.currentSegmentIndex) {
        return null;
      }

      if (segmentIndex === state.currentSegmentIndex) {
        if (segment.type === 'html') {
          return segment.content;
        }
        return segment.content.slice(0, state.currentCharIndex);
      }

      return segment.content;
    }).join('');
  }, [state.segments, state.currentSegmentIndex, state.currentCharIndex]);

  const isTypingComplete = useMemo(() => {
    return (
      state.currentSegmentIndex === state.segments.length - 1 &&
      state.currentCharIndex >= (state.segments[state.currentSegmentIndex]?.length || 0)
    );
  }, [state]);

  return (
    <div className={`markdown-typewriter max-w-3xl mx-auto p-4 ${className}`}>
      <div 
        dangerouslySetInnerHTML={{ __html: renderContent }} 
        className="inline"
      />
      {cursor && !isTypingComplete && (
        <Cursor 
          style={typeof cursor === 'object' ? mergeCursorStyles(cursor) : cursorPresets.block}
          visible={state.showCursor}
        />
      )}
    </div>
  );
};

export default MarkdownTypewriter
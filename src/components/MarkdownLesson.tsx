import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { Check, Circle } from 'lucide-react';
import { slugify } from '../data/content';
import type { StudyTopic } from '../data/content';

function textFromChildren(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(textFromChildren).join('');
  if (value && typeof value === 'object' && 'props' in value) {
    const props = (value as { props?: { children?: unknown } }).props;
    return textFromChildren(props?.children);
  }
  return '';
}

export default function MarkdownLesson({ markdown, topics, completedTopicIds, onToggleTopic }: {
  markdown: string;
  topics: StudyTopic[];
  completedTopicIds: string[];
  onToggleTopic: (topicId: string) => void;
}) {
  const topicMap = useMemo(() => new Map(topics.map((topic) => [slugify(topic.title), topic])), [topics]);
  const components: Components = {
    h2({ children }) {
      const title = textFromChildren(children);
      const topic = topicMap.get(slugify(title));
      const completed = topic ? completedTopicIds.includes(topic.id) : false;
      return (
        <h2 id={topic?.id ?? slugify(title)} className={`lesson-h2${topic ? ' lesson-h2-trackable' : ''}`}>
          <span>{children}</span>
          {topic && (
            <button type="button" className={`topic-complete${completed ? ' topic-complete-yes' : ''}`} onClick={() => onToggleTopic(topic.id)} aria-label={`${completed ? 'Desmarcar' : 'Marcar'} tópico: ${topic.title}`} aria-pressed={completed}>
              {completed ? <Check size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
              <span>{completed ? 'Revisado' : 'Marcar revisão'}</span>
            </button>
          )}
        </h2>
      );
    },
    a({ href, children }) {
      const external = href?.startsWith('http');
      return <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;
    },
    table({ children }) { return <div className="table-scroll"><table>{children}</table></div>; },
    blockquote({ children }) { return <blockquote className="lesson-quote">{children}</blockquote>; },
  };
  return <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{markdown}</ReactMarkdown></div>;
}

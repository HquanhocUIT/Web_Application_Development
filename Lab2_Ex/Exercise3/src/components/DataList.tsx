import type { FeedItem } from '../types/feed';

export function DataList({ items }: { items: FeedItem[] }) {
  return (
    <ul className="feed-grid data-list" aria-label="Latest stories">
      {items.map((item, index) => (
        <li className="feed-card story-card" key={item.id}>
          <div className="card-upper"><span className={`category category-${item.category.toLowerCase()}`}>{item.category}</span><span className="story-number">{String(index + 1).padStart(2, '0')}</span></div>
          <h3>{item.title}</h3>
          <p className="story-summary">{item.summary}</p>
          <div className="story-footer"><span className="avatar" aria-hidden="true">{item.author.split(' ').map(part => part[0]).join('')}</span><div><strong>{item.author}</strong><small>{item.date} · {item.readTime}</small></div></div>
        </li>
      ))}
    </ul>
  );
}

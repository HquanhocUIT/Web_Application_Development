export type FeedCategory = 'Engineering' | 'Design' | 'Product' | 'Research';
export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  category: FeedCategory;
  author: string;
  date: string;
  readTime: string;
}
export type FetchMode = 'success' | 'failure' | 'random';

export interface Article {
  _id: string;
  title: string;
  content: string;
  source_url: string;
  caption: string;
  slug: string;
  published_at: string;
  category: string;
  featured?: boolean;
  popular?: boolean;
}

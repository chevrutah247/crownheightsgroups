import CategoryPageClient from './CategoryPageClient';

interface PageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: PageProps) {
  return <CategoryPageClient slug={params.slug} />;
}

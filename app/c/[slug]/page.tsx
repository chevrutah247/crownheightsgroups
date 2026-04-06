import type { Metadata } from 'next';
import { categories } from '@/lib/data';
import CategoryPageClient from './CategoryPageClient';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = categories.find((c) => c.slug === params.slug);
  const name = category ? category.name : params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const icon = category?.icon || '';
  const title = `${icon ? icon + ' ' : ''}${name} Groups`;
  const description = `Browse ${name} WhatsApp groups and resources in Crown Heights, Brooklyn. Find and join community groups for ${name.toLowerCase()}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Crown Heights Groups`,
      description,
      url: `https://www.crownheightsgroups.com/c/${params.slug}`,
    },
    alternates: {
      canonical: `https://www.crownheightsgroups.com/c/${params.slug}`,
    },
  };
}

export default function CategoryPage({ params }: PageProps) {
  return <CategoryPageClient slug={params.slug} />;
}

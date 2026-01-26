import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, groups, locations, getCategoryBySlug, getLocationById } from '@/lib/data';
import CategoryPageClient from './CategoryPageClient';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }
  
  return {
    title: `${category.name} WhatsApp Groups`,
    description: `Find and join ${category.name.toLowerCase()} WhatsApp groups in Crown Heights and surrounding areas.`,
    openGraph: {
      title: `${category.name} WhatsApp Groups | Crown Heights Groups`,
      description: `Browse ${category.name.toLowerCase()} groups in your community.`,
    },
  };
}

export default function CategoryPage({ params }: Props) {
  const category = getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }
  
  const categoryGroups = groups.filter(
    g => g.categoryId === category.id && g.status === 'approved'
  );
  
  const enrichedGroups = categoryGroups.map(group => ({
    ...group,
    category,
    location: getLocationById(group.locationId),
  }));
  
  return (
    <CategoryPageClient 
      category={category} 
      groups={enrichedGroups}
      locations={locations.filter(l => l.status === 'approved')}
    />
  );
}

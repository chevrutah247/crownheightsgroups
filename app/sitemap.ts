import { MetadataRoute } from 'next';
import { groups, categories, locations } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://crownheightsgroups.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/suggest`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Category pages
  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/c/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Location pages
  const locationPages = locations
    .filter(loc => loc.status === 'approved')
    .map(location => ({
      url: `${baseUrl}/area/${location.neighborhood.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Group pages
  const groupPages = groups
    .filter(group => group.status === 'approved')
    .map(group => ({
      url: `${baseUrl}/g/${group.id}`,
      lastModified: new Date(group.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...locationPages, ...groupPages];
}

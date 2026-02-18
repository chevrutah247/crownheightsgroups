import { MetadataRoute } from 'next';
import { categories, serviceCategories } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://crownheightsgroups.com';
  const lastModified = new Date();

  const staticPages = [
    { url: baseUrl, lastModified, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/classifieds`, lastModified, changeFrequency: 'daily' as const, priority: 0.95 },
    { url: `${baseUrl}/groups`, lastModified, changeFrequency: 'daily' as const, priority: 0.95 },
    { url: `${baseUrl}/services`, lastModified, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/business`, lastModified, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified, changeFrequency: 'daily' as const, priority: 0.85 },
    { url: `${baseUrl}/events`, lastModified, changeFrequency: 'daily' as const, priority: 0.85 },
    { url: `${baseUrl}/torah-groups`, lastModified, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${baseUrl}/gemach`, lastModified, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/shabbos`, lastModified, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/charity`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/kallah`, lastModified, changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${baseUrl}/updates`, lastModified, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/subscribe`, lastModified, changeFrequency: 'monthly' as const, priority: 0.65 },
    { url: `${baseUrl}/suggest`, lastModified, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/suggest-group`, lastModified, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/suggest-service`, lastModified, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/cyber-safety`, lastModified, changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/c/${cat.slug}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const servicePages = serviceCategories.map((cat) => ({
    url: `${baseUrl}/services/${cat.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...servicePages];
}

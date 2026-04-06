'use client'

import { usePathname } from 'next/navigation'

const LABELS: Record<string, string> = {
  groups: 'Groups',
  business: 'Businesses',
  events: 'Events',
  classifieds: 'Classifieds',
  services: 'Services',
  charity: 'Charity',
  gemach: 'Gemach',
  news: 'News',
  shabbos: 'Shabbos Hosting',
  shuls: 'Shuls',
  contact: 'Contact',
  search: 'Search',
  'torah-groups': 'Torah Groups',
  'suggest-group': 'Suggest Group',
  'suggest-service': 'Suggest Service',
  subscribe: 'Subscribe',
  profile: 'Profile',
  'photo-archive': 'Photo Archive',
  updates: 'Updates',
  lottery: 'Lottery',
  kallah: 'Kallah',
  yeshivas: 'Yeshivas',
  'cyber-safety': 'Cyber Safety',
  c: 'Category',
  add: 'Add',
  admin: 'Admin',
  auth: 'Auth',
}

const BASE = 'https://www.crownheightsgroups.com'

export default function BreadcrumbJsonLd() {
  const pathname = usePathname()
  if (!pathname || pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  const items = [
    { '@type': 'ListItem' as const, position: 1, name: 'Home', item: BASE },
  ]

  let path = ''
  segments.forEach((seg, i) => {
    path += `/${seg}`
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      item: `${BASE}${path}`,
    })
  })

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items,
        }),
      }}
    />
  )
}

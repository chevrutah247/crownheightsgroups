import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cyber Safety Guide',
  description: 'Protect yourself online with our step-by-step cyber safety guide. Check for email breaches, create strong passwords, scan for viruses, and verify suspicious links.',
  openGraph: {
    title: 'Cyber Safety Guide | Crown Heights Groups',
    description: 'Protect yourself online with our step-by-step cyber safety guide. Check for email breaches, create strong passwords, scan for viruses, and verify suspicious links.',
    url: 'https://www.crownheightsgroups.com/cyber-safety',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/cyber-safety',
  },
};

export default function CyberSafetyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

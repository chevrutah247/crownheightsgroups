import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add a Group',
  description: 'Share a WhatsApp, Telegram, or Facebook group with the Crown Heights community. Submit your group for review and listing.',
  openGraph: {
    title: 'Add a Group | Crown Heights Groups',
    description: 'Share a WhatsApp, Telegram, or Facebook group with the Crown Heights community. Submit your group for review and listing.',
    url: 'https://www.crownheightsgroups.com/add/group',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/add/group',
  },
};

export default function AddGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

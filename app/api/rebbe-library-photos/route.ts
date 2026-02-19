import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|heic)$/i;

function naturalCompare(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'rebbe-library');
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const names = entries
      .filter((entry) => entry.isFile() && IMAGE_EXT.test(entry.name))
      .map((entry) => entry.name)
      .sort(naturalCompare);

    const photos = names.map((name, i) => ({
      id: `rebbe-library-${i + 1}`,
      src: `/images/rebbe-library/${name}`,
      title: `Rebbe Library - Photo ${i + 1}`,
    }));

    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}

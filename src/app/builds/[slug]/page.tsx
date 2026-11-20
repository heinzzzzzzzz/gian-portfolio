import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import BuildsHall from '@/components/BuildsHall';
import { DOORS } from '@/lib/doors';

export function generateStaticParams() {
  return DOORS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const door = DOORS.find((d) => d.slug === slug);
  if (!door) return {};
  return { title: `${door.label} — Gian Benedict Bigay`, description: `Every ${door.label.toLowerCase()} build, one preview at a time.` };
}

export default async function BuildsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!DOORS.some((d) => d.slug === slug)) notFound();
  return (
    <>
      <Navbar />
      <BuildsHall slug={slug} />
    </>
  );
}

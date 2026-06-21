import { TripDetailShell } from "@/components/trips/TripDetailShell";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  return <TripDetailShell id={id} />;
}

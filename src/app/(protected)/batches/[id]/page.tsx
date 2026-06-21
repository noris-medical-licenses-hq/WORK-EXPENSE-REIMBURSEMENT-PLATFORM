import { BatchDetailShell } from "@/components/batches/BatchDetailShell";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BatchDetailPage({ params }: Props) {
  const { id } = await params;
  return <BatchDetailShell id={id} />;
}

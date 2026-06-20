import { ExpenseDetailShell } from "@/components/expenses/ExpenseDetailShell";

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExpenseDetailShell id={id} />;
}

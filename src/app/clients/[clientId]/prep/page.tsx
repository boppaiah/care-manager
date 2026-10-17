import { Prep } from "@/features/prep/prep";
export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <Prep clientId={clientId} />;
}

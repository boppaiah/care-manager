import { FollowUps } from "@/features/follow-ups/follow-ups";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const query = await searchParams;
  return <FollowUps initiallyCreating={query.new === "1"} />;
}

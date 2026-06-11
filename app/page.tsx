import SiteExperience from "@/components/SiteExperience";
import StaticLanding from "@/components/StaticLanding";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Set by the no-JS form POST redirect
  const { subscribed } = await searchParams;
  const initialDone = subscribed === "1";

  return (
    <SiteExperience initialDone={initialDone}>
      <StaticLanding initialDone={initialDone} />
    </SiteExperience>
  );
}

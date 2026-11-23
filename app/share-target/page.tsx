import { Suspense } from "react";
import { ShareTargetPageContent } from "@/components/share-target/ShareTargetPageContent";
import { ShareTargetLoading } from "@/components/share-target/ShareTargetGate";

export default function ShareTargetPage() {
  return (
    <Suspense fallback={<ShareTargetLoading />}>
      <ShareTargetPageContent />
    </Suspense>
  );
}

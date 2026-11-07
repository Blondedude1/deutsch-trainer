"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { DrillRunner, type DrillTarget } from "@/components/drill/DrillRunner";
import { BackLink } from "@/components/ui/primitives";
import { MISTAKE_TAGS, type MistakeTag } from "@/lib/tags";

const isTag = (t: string): t is MistakeTag => (MISTAKE_TAGS as readonly string[]).includes(t);

function DrillFromParams() {
  const params = useSearchParams();
  const t = params.get("t");
  const leak = params.get("leak");
  const qa = params.get("qa");

  const target = useMemo<DrillTarget | null>(() => {
    if (t) return { kind: "topic", topicId: t };
    if (leak && isTag(leak)) return { kind: "leak", tag: leak };
    if (qa) {
      const tags = qa.split(",").filter(isTag);
      if (tags.length) return { kind: "qa", tags };
    }
    return null;
  }, [t, leak, qa]);

  if (!target)
    return (
      <div className="px-5 pt-3">
        <BackLink />
        <p className="text-sm text-muted">Nothing to drill here.</p>
      </div>
    );
  const key = target.kind === "topic" ? target.topicId : target.kind === "leak" ? target.tag : target.tags.join(",");
  return <DrillRunner key={key} target={target} />;
}

export default function DrillPage() {
  return (
    <Suspense>
      <DrillFromParams />
    </Suspense>
  );
}

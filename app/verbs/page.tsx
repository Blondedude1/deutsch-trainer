import { Card } from "@/components/ui/primitives";

export default function VerbsPage() {
  return (
    <div className="flex flex-col gap-4 px-5 pt-5 md:max-w-2xl md:pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-head text-2xl font-bold">Verbs</h1>
        <p className="m-0 text-sm text-muted">Irregular verb cards with spaced repetition.</p>
      </div>
      <Card>
        <p className="m-0 text-sm text-soft">
          Coming in Phase 2: 60 irregular verbs. You type the Präteritum and Partizip II, the app checks the HABEN/SEIN helper, and Leitner boxes decide what is due each day.
        </p>
      </Card>
    </div>
  );
}

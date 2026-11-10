import { Brand } from "@/components/brand";

export default function Loading() {
  return (
    <main className="app" aria-busy="true">
      <Brand />
      <p className="hint" role="status">
        Getting your questions ready…
      </p>
    </main>
  );
}

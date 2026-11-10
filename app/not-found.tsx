import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="app">
      <Brand />
      <h1 className="lede">We could not find that page.</h1>
      <p className="hint">The link may be old or mistyped. You can start the quiz from the beginning.</p>
      <div className="sticky">
        <Link className="primary link-button" href="/">
          Go to the start
        </Link>
      </div>
    </main>
  );
}

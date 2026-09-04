import { AttentionInbox } from "@/components/watchlist/AttentionInbox";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-neutral-800">
      <AttentionInbox />
    </main>
  );
}

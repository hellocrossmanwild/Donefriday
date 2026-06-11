// Minimal event tracking: forwards to Vercel Analytics when present,
// logs in development otherwise. Events used:
//   act_viewed { act: 1|2|3|4 }   scroll depth per act
//   subscribe_submitted, subscribe_done, subscribe_error

type Props = Record<string, string | number>;

declare global {
  interface Window {
    va?: (event: "event", payload: { name: string; data?: Props }) => void;
  }
}

export function track(name: string, data?: Props) {
  if (typeof window === "undefined") return;
  try {
    window.va?.("event", { name, data });
    if (process.env.NODE_ENV !== "production") {
      console.debug("[track]", name, data ?? "");
    }
  } catch {
    // analytics must never break the page
  }
}

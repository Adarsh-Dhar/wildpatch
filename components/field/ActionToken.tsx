import type { ActionId } from "@/lib/types";

export function ActionToken({ actionId }: { actionId: ActionId }) {
  if (actionId === "bank-control")
    return (
      <svg viewBox="0 0 80 60" aria-hidden="true">
        <path
          d="M8 43 21 25l12 17 11-25 14 27 9-15 8 18H8z"
          fill="#8b8b76"
          stroke="#4b5547"
          strokeWidth="3"
        />
        <path d="M12 45h57v8H12z" fill="#6b614d" />
        <circle cx="25" cy="48" r="2" fill="#d9c4a0" />
        <circle cx="52" cy="48" r="2" fill="#d9c4a0" />
      </svg>
    );
  if (actionId === "remove-invasives")
    return (
      <svg viewBox="0 0 80 60" aria-hidden="true">
        <path
          d="m24 44 28-28m-5 3 9-9 10 10-9 9M15 49l8-8m-3-3 9 9"
          fill="none"
          stroke="#4e6942"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M21 25q-7-8-2-15 10 0 11 11m20 33q10-9 17-4-3 11-14 11"
          fill="#6e9a5b"
          stroke="#3f5b3a"
          strokeWidth="2"
        />
      </svg>
    );
  if (actionId === "fish-stocking")
    return (
      <svg viewBox="0 0 80 60" aria-hidden="true">
        <path
          d="M10 24h58v29H10z"
          fill="#b5895d"
          stroke="#624e39"
          strokeWidth="3"
        />
        <path
          d="M10 34h58M23 24v29m31-29v29"
          stroke="#dbc29a"
          strokeWidth="2"
        />
        <path
          d="M25 17q8-8 16 0-8 8-16 0m19-6q7-7 14 0-7 7-14 0"
          fill="#6f9ba0"
          stroke="#3d6972"
          strokeWidth="2"
        />
        <circle cx="34" cy="17" r="1" fill="#23301f" />
      </svg>
    );
  if (actionId === "fertilizer")
    return (
      <svg viewBox="0 0 80 60" aria-hidden="true">
        <path
          d="m24 17 9-8h17l8 8 7 35H17z"
          fill="#e4d5aa"
          stroke="#86734c"
          strokeWidth="3"
        />
        <path d="M32 10h18m-23 17h27" stroke="#ad8c52" strokeWidth="3" />
        <path
          d="M34 34h12m-6-6v13"
          stroke="#668052"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M27 51h31" stroke="#786543" strokeWidth="4" />
      </svg>
    );
  return (
    <svg viewBox="0 0 80 60" aria-hidden="true">
      <rect
        x="15"
        y="17"
        width="50"
        height="34"
        rx="5"
        fill="#d9c9a6"
        stroke="#75644a"
        strokeWidth="3"
      />
      <path
        d="M22 26h36m-29 0v18m14-18v18m14-18v18M15 50h50"
        stroke="#9a8763"
        strokeWidth="2"
      />
      <path d="M29 12h22" stroke="#536f45" strokeWidth="4" />
    </svg>
  );
}

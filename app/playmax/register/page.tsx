// app/playmax/register/page.tsx
"use client";

import dynamic from "next/dynamic";

const ClientForm = dynamic(() => import("./ClientForm"), { ssr: false });

export default function Page() {
  return <ClientForm />;
}

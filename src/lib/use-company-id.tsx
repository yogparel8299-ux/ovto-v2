"use client";

import { useEffect, useState } from "react";
import { getWorkspaceContext } from "@/lib/supabase/dashboard";

export function useCompanyId() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getWorkspaceContext().then((ctx) => {
      if (cancelled) return;
      setCompanyId(ctx?.companyId ?? null);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { companyId, ready };
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border border-stone-200 p-10 rounded-2xl text-center bg-white">
      <p className="text-sm font-bold text-stone-950">{title}</p>
      {description ? (
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}

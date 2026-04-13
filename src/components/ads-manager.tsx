"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Copy, Check, Play, Pause } from "lucide-react";
import type { Ad } from "@/lib/types";

const formatLabels: Record<string, string> = {
  video_reel: "Video / Reel",
  imagen_estatica: "Imagen estática",
  imagen_carrusel: "Carrusel",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  paused: "secondary",
  draft: "outline",
};

const statusLabel: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
  draft: "Borrador",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={copy} title="Copiar caption">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function AdsManager({ ads }: { ads: Ad[] }) {
  const router = useRouter();
  const supabase = createClient();

  async function toggleStatus(ad: Ad) {
    const next = ad.status === "active" ? "paused" : "active";
    await supabase.from("ads").update({ status: next }).eq("id", ad.id);
    router.refresh();
  }

  // Group by product name
  const grouped = ads.reduce<Record<string, Ad[]>>((acc, ad) => {
    const key = ad.products?.name ?? "Sin producto";
    if (!acc[key]) acc[key] = [];
    acc[key].push(ad);
    return acc;
  }, {});

  if (ads.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No hay anuncios registrados
      </div>
    );
  }

  return (
    <div className="divide-y">
      {Object.entries(grouped).map(([productName, productAds]) => (
        <div key={productName}>
          <div className="px-4 py-3 bg-muted/40">
            <p className="text-sm font-semibold">{productName}</p>
            <p className="text-xs text-muted-foreground">
              {productAds.filter((a) => a.status === "active").length} activo(s) ·{" "}
              {productAds.filter((a) => a.status === "paused").length} pausado(s)
            </p>
          </div>
          <div className="divide-y">
            {productAds.map((ad) => (
              <div key={ad.id} className="px-4 py-4 flex gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">Ad #{ad.ad_number}</span>
                    <Badge variant="outline" className="text-xs">{formatLabels[ad.format]}</Badge>
                    <Badge variant={statusVariant[ad.status]} className="text-xs">
                      {statusLabel[ad.status]}
                    </Badge>
                  </div>
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-md p-3 border">
                    {ad.caption}
                  </pre>
                </div>
                <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                  <CopyButton text={ad.caption} />
                  {ad.status !== "draft" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => toggleStatus(ad)}
                      title={ad.status === "active" ? "Pausar" : "Activar"}
                    >
                      {ad.status === "active" ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

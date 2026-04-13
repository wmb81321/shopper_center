"use client";

import { Badge } from "@/components/ui/badge";
import type { Segment } from "@/lib/types";

function TagList({ items }: { items: string[] | null }) {
  if (!items || items.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item} variant="outline" className="text-xs font-normal">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 border-b last:border-0">
      <span className="text-xs text-muted-foreground pt-0.5 shrink-0">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export function SegmentsViewer({ segments }: { segments: Segment[] }) {
  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No hay segmentos registrados
      </div>
    );
  }

  return (
    <div className="divide-y">
      {segments.map((seg) => (
        <div key={seg.id}>
          <div className="px-4 py-3 bg-muted/40">
            <p className="text-sm font-semibold">{seg.products?.name ?? "Producto"}</p>
            <p className="text-xs text-muted-foreground">{seg.label}</p>
          </div>
          <div className="px-4 py-2">
            <Row label="Edad">
              {seg.age_min != null && seg.age_max != null ? (
                <span className="text-sm">{seg.age_min}–{seg.age_max} años</span>
              ) : <span className="text-xs text-muted-foreground">—</span>}
            </Row>
            <Row label="Género">
              <span className="text-sm">{seg.gender ?? "—"}</span>
            </Row>
            {seg.relationship_status && seg.relationship_status.length > 0 && (
              <Row label="Estado civil">
                <TagList items={seg.relationship_status} />
              </Row>
            )}
            {seg.education && seg.education.length > 0 && (
              <Row label="Educación">
                <TagList items={seg.education} />
              </Row>
            )}
            {seg.occupations && seg.occupations.length > 0 && (
              <Row label="Ocupaciones">
                <TagList items={seg.occupations} />
              </Row>
            )}
            <Row label="Ciudades Tier 1">
              <TagList items={seg.cities_tier1} />
            </Row>
            {seg.cities_tier2 && seg.cities_tier2.length > 0 && (
              <Row label="Ciudades Tier 2">
                <TagList items={seg.cities_tier2} />
              </Row>
            )}
            <Row label="Intereses capa 1">
              <TagList items={seg.interests_layer1} />
            </Row>
            {seg.interests_layer2 && seg.interests_layer2.length > 0 && (
              <Row label="Intereses capa 2">
                <TagList items={seg.interests_layer2} />
              </Row>
            )}
            {seg.interests_layer3 && seg.interests_layer3.length > 0 && (
              <Row label="Intereses capa 3">
                <TagList items={seg.interests_layer3} />
              </Row>
            )}
            <Row label="Dispositivo">
              <span className="text-sm">{seg.device ?? "—"}</span>
            </Row>
            {seg.android_models && seg.android_models.length > 0 && (
              <Row label="Android">
                <TagList items={seg.android_models} />
              </Row>
            )}
            {seg.ios_models && seg.ios_models.length > 0 && (
              <Row label="iOS">
                <TagList items={seg.ios_models} />
              </Row>
            )}
            {seg.behaviors && seg.behaviors.length > 0 && (
              <Row label="Comportamientos">
                <TagList items={seg.behaviors} />
              </Row>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

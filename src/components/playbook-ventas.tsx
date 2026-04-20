"use client";

import { useState, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { setPlaybookProduct } from "@/app/(admin)/playbook/actions";
import type { Product } from "@/lib/types";

// ─── Stage accent colors ───────────────────────────────────────────────────────
const SC = {
  whatsapp: "#25D366",
  blue: "#3b82f6",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  red: "#ef4444",
  green: "#10b981",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Script { label: string; text: string; }
interface Stage {
  id: string; emoji: string; title: string; subtitle: string;
  color: string; goal: string; scripts: Script[];
}

// ─── Token helpers ─────────────────────────────────────────────────────────────

const numFmt = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const cop = (n?: number | null) => (n == null ? "" : numFmt.format(n));
const copStr = (n?: number | null) => (n == null ? "" : "$" + numFmt.format(n));

function buildTokens(p: Product | null, products: Product[]): Record<string, string> {
  const menu = products
    .filter((prod) => prod.is_active)
    .slice(0, 9)
    .map((prod, i) => {
      const price = prod.promo_active && prod.price_promo ? prod.price_promo : prod.sale_price;
      return `${i + 1}. ${prod.name} (${copStr(price)})`;
    })
    .join("\n");

  if (!p) return { menu_productos: menu };

  const precioVal = p.promo_active && p.price_promo ? p.price_promo : p.sale_price;
  const precioRegVal = p.price_regular ?? p.base_price ?? precioVal;
  const ahorroVal = Math.max(0, (precioRegVal ?? 0) - (precioVal ?? 0));
  const tallas =
    p.sizes && p.sizes.length > 0
      ? p.sizes.map((s) => s.size + (s.stock === 0 ? " (agotada)" : "")).join(", ")
      : p.size_info ?? "Talla unica";
  const caracteristicas = (p.features ?? []).map((f) => "* " + f).join("\n");

  return {
    product: p.name,
    precio: copStr(precioVal),
    precio_regular: copStr(precioRegVal),
    ahorro: copStr(ahorroVal),
    tallas,
    caracteristicas,
    combo: p.name,
    combo_items: (p.combo_items ?? []).join(" + "),
    menu_productos: menu,
  };
}

function resolveTemplate(tpl: string, tokens: Record<string, string>): string {
  return tpl
    .replace(/\{\{(\w+)\}\}/g, (_, key) =>
      key in tokens ? tokens[key] : `{{${key}}}`
    )
    .replace(/\n{3,}/g, "\n\n");
}

// ─── Script data ──────────────────────────────────────────────────────────────

const L = (...rows: string[]) => rows.join("\n");

const funnelStages: Stage[] = [
  {
    id: "bienvenida", emoji: "👋", title: "Bienvenida",
    subtitle: "0-2 min despues del mensaje", color: SC.whatsapp,
    goal: "Enganchar + identificar que producto quiere",
    scripts: [
      {
        label: "Respuesta inmediata (menos de 5 min)",
        text: L(
          "¡Hola! 😊 Gracias por escribirnos. Sí tenemos disponible. ¿Para quién es? Dime la talla y te confirmo disponibilidad ahora mismo. 👇"
        ),
      },
      {
        label: "Si preguntan por Camiseta ($89.900)",
        text: L(
          "👕 Camiseta Selección Colombia — $89.900 con envío incluido. Tenemos tallas S, M, L y XL. ¿Cuál necesitas? Te la apartamos de una vez."
        ),
      },
      {
        label: "Si preguntan por Body ($79.900)",
        text: L(
          "👙 Body Selección Colombia — $79.900 con envío incluido. Tallas S, M y L. ¿Cuál te queda? Te lo apartamos ya."
        ),
      },
      {
        label: "Si preguntan por Combos",
        text: L(
          "🔥 Tenemos 3 combos con descuento especial:",
          "💑 Pareja (Camiseta + Body): $159.900",
          "🤝 Parceros (2 Camisetas): $169.900",
          "👯‍♀️ Amigas (2 Bodys): $149.900",
          "Todos con envío incluido. ¿Cuál te interesa?"
        ),
      },
    ],
  },
  {
    id: "interes", emoji: "🎯", title: "Captura de Interes",
    subtitle: "Despues de que responden", color: SC.blue,
    goal: "Confirmar producto + generar urgencia",
    scripts: [
      {
        label: "Cuando dicen 'si me interesa'",
        text: L(
          "Dale! Te cuento por que este {{product}} es diferente:",
          "",
          "🏆 Es la camiseta/body oficial del Mundial 2026",
          "🇨🇴 Colombia juega el 17 de junio vs Uzbekistan",
          "📦 Te llega en 5 dias — justo a tiempo",
          "💰 Precio promo: solo {{precio}} (se acaba pronto)",
          "🚚 Envio GRATIS + pagas cuando te llega",
          "",
          "Ya hemos enviado mas de {{pedidos_semana}} pedidos esta semana 📦",
          "",
          "Lo pedimos? Te toma menos de 1 minuto 👇"
        ),
      },
      {
        label: "Cuando preguntan por tallas",
        text: L(
          "Buena pregunta!",
          "",
          "👕 {{product}}: Tenemos {{tallas}}",
          "",
          "Cual es tu talla? Asi te confirmo disponibilidad al toque 🔥"
        ),
      },
    ],
  },
  {
    id: "cierre", emoji: "🔥", title: "Cierre — Pedir Datos",
    subtitle: "El momento clave", color: SC.amber,
    goal: "Obtener los 5 datos para crear la orden",
    scripts: [
      {
        label: "⭐ Cierre directo (EL MAS IMPORTANTE)",
        text: L(
          "Perfecto, te la aparto. 📦 Para enviarte necesito: nombre completo, ciudad, dirección y un celular de contacto. Te llega en 3-5 días hábiles."
        ),
      },
      {
        label: "Cierre para combos",
        text: L(
          "Excelente! El {{combo}} es la mejor opcion 💪",
          "",
          "Para armarte el pedido necesito:",
          "",
          "📝 Nombre completo:",
          "🏙️ Ciudad:",
          "🏠 Direccion completa:",
          "📱 Numero de contacto:",
          "📧 Correo:",
          "👕 Talla camiseta (si aplica):",
          "",
          "Recuerda: pagas cuando te llega. Sin riesgo 💯"
        ),
      },
      {
        label: "Cierre asumido",
        text: L(
          "Ya te lo tengo apartado 🔒",
          "",
          "Solo pasame tus datos para generar la guia de envio:",
          "",
          "Nombre:",
          "Ciudad:",
          "Direccion:",
          "Telefono:",
          "Correo:",
          "",
          "Lo despacho hoy y te llega en 5 dias 📦🇨🇴"
        ),
      },
    ],
  },
  {
    id: "objeciones", emoji: "🛡️", title: "Manejo de Objeciones",
    subtitle: "Cuando dudan o no responden", color: SC.purple,
    goal: "Resolver dudas y recuperar el interes",
    scripts: [
      {
        label: '"Es muy caro" / "No tengo plata"',
        text: L(
          "Entiendo 💛 Pero mira esto:",
          "",
          "La camiseta original en tienda esta a $350.000+",
          "Nosotros la tenemos a {{precio}} — menos de la mitad 🤯",
          "",
          "Y lo mejor: pagas CUANDO TE LLEGA. No tienes que pagar nada ahora.",
          "",
          "Es precio de Mundial, y cuando empiece el torneo suben seguro. Te la aparto?"
        ),
      },
      {
        label: '"Es original?" / "Es confiable?"',
        text: L(
          "Claro! Te cuento:",
          "",
          "✅ Producto con tecnologia AEROREADY",
          "✅ Escudo tejido de la Seleccion",
          "✅ Envio con guia de rastreo (Servientrega/Coordinadora)",
          "✅ Pagas contraentrega — si no te gusta, no pagas",
          "✅ Ya llevamos {{pedidos_semana}} pedidos enviados esta semana",
          "",
          "0 riesgo para ti. Lo pedimos? 🇨🇴"
        ),
      },
      {
        label: '"Dejame pensarlo" / "Luego te escribo"',
        text: L(
          "Dale! Sin presion 🙌",
          "",
          "Solo te aviso que quedan pocas unidades al precio promo de {{precio}} y cuando se acaben vuelven al precio regular de {{precio_regular}}.",
          "",
          "Si quieres, te lo aparto por las proximas 2 horas sin compromiso. Te parece? 🔒"
        ),
      },
      {
        label: '"Hay descuento?" / "Me haces rebaja?"',
        text: L(
          "El precio ya es de oferta (el regular es $119.900/$99.900). Pero te incluimos el envío gratis, que normalmente cuesta $12.000-$15.000. Es lo mejor que hay ahorita."
        ),
      },
      {
        label: '"Puedo ver fotos?" / "Como es?"',
        text: L(
          "Claro! Mira 👇",
          "",
          "[📸 Enviar fotos del producto aqui]",
          "",
          "🔥 Es espectacular en persona — las fotos no le hacen justicia",
          "",
          "Te gusta? Te lo pedimos? 🇨🇴"
        ),
      },
    ],
  },
  {
    id: "followup", emoji: "📲", title: "Follow-Up",
    subtitle: "Si no responden", color: SC.red,
    goal: "Recuperar leads frios sin ser invasivo",
    scripts: [
      {
        label: "Follow-up #1 — 2 horas despues",
        text: L(
          "¡Hola! Vi que estabas interesado/a en la camiseta de Colombia 🇨🇴 ¿Todavía la quieres? Te la tengo apartada pero se están agotando las tallas."
        ),
      },
      {
        label: "Follow-up #2 — Al dia siguiente",
        text: L(
          "Hola de nuevo! 🇨🇴",
          "",
          "Solo queria avisarte que el {{product}} se esta agotando — hoy ya van {{pedidos_semana}} pedidos.",
          "",
          "Si todavia lo quieres, me avisas y te lo aparto al precio promo 💛",
          "",
          "Recuerda: envio gratis + pagas cuando te llega ✅"
        ),
      },
      {
        label: "Follow-up #3 — 2 dias despues (ultimo)",
        text: L(
          "👋 Ultimo aviso:",
          "",
          "El precio promo de {{precio}} del {{product}} se acaba esta semana.",
          "",
          "Despues vuelve a {{precio_regular}}.",
          "",
          'Si lo quieres, solo dime "va" y te lo aparto en 1 minuto 🔥'
        ),
      },
    ],
  },
  {
    id: "confirmacion", emoji: "✅", title: "Confirmacion de Orden",
    subtitle: "Cuando dan los datos", color: SC.green,
    goal: "Confirmar, generar confianza y upsell",
    scripts: [
      {
        label: "Confirmacion de pedido",
        text: L(
          "🎉 PEDIDO CONFIRMADO!",
          "",
          "Aqui tu resumen:",
          "",
          "📦 Producto: {{product}}",
          "👕 Talla: {{talla_elegida}}",
          "💰 Total: {{precio}} (envio GRATIS)",
          "💳 Pago: Contraentrega",
          "📍 Envio a: {{ciudad}}",
          "🕐 Entrega estimada: 5 dias habiles",
          "",
          "Te enviare tu numero de guia apenas se despache 📲",
          "",
          "Gracias por confiar en nosotros! 🇨🇴⚽"
        ),
      },
      {
        label: "Upsell despues de confirmar",
        text: L(
          "Por cierto, si quieres otra para tu [parce/amiga/pareja], tenemos combos desde $149.900 las dos. Te ahorras plata vs comprarlas por separado. ¿Te interesa?"
        ),
      },
    ],
  },
];

const quickRules = [
  { icon: "⚡", title: "Responde en menos de 2 min", desc: "Cada minuto que pasa, la probabilidad de cierre baja un 10%. El lead esta caliente AHORA." },
  { icon: "🎯", title: "Siempre cierra pidiendo datos", desc: 'Nunca termines un mensaje sin una pregunta o call to action. Nunca digas "cualquier cosa me escribes".' },
  { icon: "🔒", title: 'Usa "te lo aparto"', desc: "Crea urgencia real. El cliente siente que puede perder la oportunidad. Funciona porque es verdad — se agotan." },
  { icon: "💳", title: "Repite CONTRAENTREGA", desc: 'Es tu arma mas poderosa. Elimina el miedo. Repitelo en cada mensaje clave: "pagas cuando te llega".' },
  { icon: "🚫", title: "No negocies precio", desc: "El precio YA tiene descuento. Muestra el ahorro vs precio regular. Si insisten, ofrece combo como alternativa." },
  { icon: "📋", title: "Copia y pega, no improvises", desc: "Los scripts estan disenados para convertir. Personaliza el nombre y producto, pero no cambies la estructura." },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(el);
      el.focus(); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button
      size="sm"
      variant={copied ? "default" : "outline"}
      className="h-7 text-xs gap-1.5"
      onClick={handleCopy}
    >
      {copied ? "✅ Copiado" : "📋 Copiar"}
    </Button>
  );
}

function ScriptCard({
  script, tokens, draftKey, drafts, onDraftChange,
}: {
  script: Script;
  tokens: Record<string, string>;
  draftKey: string;
  drafts: Record<string, string>;
  onDraftChange: (key: string, value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState("");

  const resolved = resolveTemplate(script.text, tokens);
  const draft = drafts[draftKey];
  const displayText = draft ?? resolved;
  const hasEdit = draft != null;

  function startEdit() { setEditBuffer(displayText); setEditing(true); }
  function saveEdit() { onDraftChange(draftKey, editBuffer); setEditing(false); }
  function resetDraft() { onDraftChange(draftKey, null); setEditing(false); }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        onClick={() => { setOpen((o) => !o); if (open) setEditing(false); }}
        className="w-full text-left flex justify-between items-center px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="pr-3 text-foreground">{script.label}</span>
        <span
          className="text-muted-foreground opacity-60 shrink-0 text-base transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-muted/20">
          {editing ? (
            <>
              <Textarea
                value={editBuffer}
                onChange={(e) => setEditBuffer(e.target.value)}
                rows={Math.max(6, displayText.split("\n").length + 1)}
                className="text-[13px] leading-relaxed font-mono resize-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button onClick={resetDraft} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                  Restablecer original
                </button>
                <div className="flex gap-2 ml-auto">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button size="sm" className="h-7 text-xs" onClick={saveEdit}>Guardar</Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {hasEdit && (
                <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400">
                  <span>✏️ Editado manualmente</span>
                  <button onClick={resetDraft} className="underline underline-offset-2 opacity-70 hover:opacity-100">Restablecer</button>
                </div>
              )}
              <pre
                className="whitespace-pre-wrap break-words text-[13px] leading-[1.75] text-foreground m-0 bg-background p-4 rounded-md border-l-[3px]"
                style={{ borderLeftColor: SC.whatsapp, fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}
              >
                {displayText}
              </pre>
              <div className="flex items-center justify-between">
                <button onClick={startEdit} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  ✏️ Editar
                </button>
                <CopyButton text={displayText} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PlaybookVentas({
  products,
  initialProductId,
}: {
  products: Product[];
  initialProductId: string;
}) {
  const [activeStage, setActiveStage] = useState("bienvenida");
  const [activeTab, setActiveTab] = useState("funnel");
  const [selectedId, setSelectedId] = useState<string>(initialProductId);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  function handleProductChange(id: string | null) {
    if (!id) return;
    setSelectedId(id);
    startTransition(() => { void setPlaybookProduct(id); });
  }

  function handleDraftChange(key: string, value: string | null) {
    setDrafts((prev) => {
      const next = { ...prev };
      if (value === null) delete next[key]; else next[key] = value;
      return next;
    });
  }

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );
  const tokens = useMemo(() => buildTokens(selected, products), [selected, products]);
  const current = funnelStages.find((s) => s.id === activeStage)!;

  const displayPrice = selected
    ? selected.promo_active && selected.price_promo ? selected.price_promo : selected.sale_price
    : null;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Playbook de Ventas</h1>
          <p className="text-sm text-muted-foreground">Scripts de WhatsApp para el funnel Mundial 2026 ⚽</p>
        </div>

        {/* Product selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground shrink-0">Producto:</span>
          <Select value={selectedId} onValueChange={handleProductChange}>
            <SelectTrigger className="flex-1 sm:w-[200px] sm:flex-none h-8 text-sm">
              <span className="truncate text-left">
                {selected?.name ?? "Selecciona..."}
              </span>
            </SelectTrigger>
            <SelectContent>
              {products.length === 0
                ? <SelectItem value="_none">No hay productos activos</SelectItem>
                : products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
          {selected && displayPrice != null && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {copStr(displayPrice)}
            </Badge>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: "funnel", label: "📊 Funnel & Scripts" },
          { id: "reglas", label: "⚡ Reglas de Oro" },
          { id: "metricas", label: "📈 Metricas" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Funnel tab ── */}
      {activeTab === "funnel" && (
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">

          {/* Stage nav */}
          <div className="space-y-1.5">
            <p className="hidden md:block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              Etapas del funnel
            </p>

            {/* Mobile: horizontal pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden bg-background py-1">
              {funnelStages.map((stage) => {
                const isActive = activeStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(stage.id)}
                    className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border text-xs font-semibold min-w-[64px] transition-colors ${
                      isActive ? "border-border bg-muted" : "border-transparent text-muted-foreground hover:bg-muted/50"
                    }`}
                    style={isActive ? { borderColor: stage.color + "60", color: stage.color } : {}}
                  >
                    <span className="text-lg leading-none">{stage.emoji}</span>
                    <span className="text-[9px] uppercase tracking-wide whitespace-nowrap">
                      {stage.title.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical list */}
            <div className="hidden md:flex flex-col gap-1">
              {funnelStages.map((stage) => {
                const isActive = activeStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(stage.id)}
                    className={`relative w-full text-left rounded-lg px-3 py-2.5 transition-colors overflow-hidden ${
                      isActive ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    {isActive && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
                        style={{ background: stage.color }}
                      />
                    )}
                    <div className="flex items-center gap-2 pl-1">
                      <span className="text-base leading-none">{stage.emoji}</span>
                      <div>
                        <p
                          className="text-xs font-semibold leading-tight"
                          style={{ color: isActive ? stage.color : undefined }}
                        >
                          {stage.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{stage.subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scripts panel */}
          <div className="space-y-4 min-w-0">
            {/* Stage header */}
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">{current.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold" style={{ color: current.color }}>
                        {current.title}
                      </h2>
                      <Badge variant="outline" className="text-[10px]">{current.subtitle}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-semibold">Objetivo:</span> {current.goal}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scripts */}
            <div className="space-y-2">
              {current.scripts.map((script, i) => (
                <ScriptCard
                  key={`${current.id}-${i}`}
                  script={script}
                  tokens={tokens}
                  draftKey={`${current.id}:${i}`}
                  drafts={drafts}
                  onDraftChange={handleDraftChange}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Reglas tab ── */}
      {activeTab === "reglas" && (
        <div className="space-y-3 max-w-2xl">
          {quickRules.map((rule, i) => (
            <Card key={i}>
              <CardContent className="flex gap-4 items-start p-4">
                <span className="text-2xl leading-none shrink-0 mt-0.5">{rule.icon}</span>
                <div>
                  <p className="text-sm font-semibold mb-0.5">{rule.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rule.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">🔄 Flujo de Respuesta Rapida</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xs text-muted-foreground leading-[2] space-y-0.5">
                {[
                  ["Lead escribe", "Responder menos de 2 min con bienvenida"],
                  ["Muestra interes", "Dar info del producto + beneficios"],
                  ["Hace preguntas", "Responder + SIEMPRE cerrar pidiendo datos"],
                  ["Da los datos", "Confirmar orden + intentar upsell combo"],
                  ["No responde", "Follow-up #1 (2h) → #2 (24h) → #3 (48h)"],
                  ["Dice no", "Agradecer + dejar puerta abierta"],
                ].map(([trigger, action]) => (
                  <div key={trigger} className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0 w-32">{trigger} →</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Metricas tab ── */}
      {activeTab === "metricas" && (
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Respuesta objetivo", value: "< 2 min", color: SC.green },
              { label: "Conversion objetivo", value: "20-30%", color: SC.amber },
              { label: "Follow-ups maximos", value: "3", color: SC.blue },
              { label: "Datos para orden", value: "5 campos", color: SC.purple },
            ].map((m, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-extrabold" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{m.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">📊 Como Medir tu Rendimiento</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-[2] space-y-1">
              {[
                ["Leads que llegan", "Cada mensaje nuevo de WhatsApp"],
                ["Leads que responden", "Los que contestan despues de tu bienvenida"],
                ["Datos recibidos", "Los que te pasan nombre, ciudad, direccion"],
                ["Ordenes confirmadas", "Pedidos creados en Dropi"],
                ["Ventas entregadas", "Pedidos que se entregaron con exito"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">• {k}:</span>
                  <span>{v}</span>
                </div>
              ))}
              <p className="pt-2 text-foreground font-medium">
                Formula: (Ordenes confirmadas / Leads) x 100 = % conversion
              </p>
              <p>Meta con estos scripts: 25-30% 🎯</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">💰 Proyeccion con 10 Leads/Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Conversion 15%", ventas: "1.5/dia", revenue: "$134.850/dia", color: "text-muted-foreground" },
                  { label: "Conversion 25%", ventas: "2.5/dia", revenue: "$224.750/dia", color: "text-amber-600" },
                  { label: "Conversion 35%", ventas: "3.5/dia", revenue: "$314.650/dia", color: "text-green-600" },
                ].map((p, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
                    <div className={`text-[11px] font-bold mb-1 ${p.color}`}>{p.label}</div>
                    <div className="text-lg font-extrabold">{p.ventas}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">~{p.revenue}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                *Basado en ticket promedio de $89.900 (producto individual)
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

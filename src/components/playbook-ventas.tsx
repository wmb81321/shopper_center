"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/lib/types";

// ─── Accent colors ────────────────────────────────────────────────────────────
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
// copStr includes the $ sign so script tokens write {{precio}} not ${{precio}}
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
// Price tokens ({{precio}}, {{precio_regular}}, {{ahorro}}) include the "$" sign.
// Manual tokens that reps fill: {{pedidos_semana}}, {{talla_elegida}}, {{ciudad}}

const lines = (...rows: string[]) => rows.join("\n");

const funnelStages: Stage[] = [
  {
    id: "bienvenida",
    emoji: "👋",
    title: "BIENVENIDA",
    subtitle: "0-2 min despues del mensaje",
    color: SC.whatsapp,
    goal: "Enganchar + identificar que producto quiere",
    scripts: [
      {
        label: "Respuesta inicial (cuando preguntan por un producto)",
        text: lines(
          "Hola! 👋 Gracias por escribirnos 🇨🇴",
          "",
          "Que bueno que te interesa! Tenemos disponibilidad todavia pero se estan agotando rapido 🔥",
          "",
          "Me cuentas cual te llamo la atencion?",
          "{{menu_productos}}"
        ),
      },
      {
        label: "Si llegan con un producto especifico",
        text: lines(
          "Hola! 👋 Excelente eleccion 🔥",
          "",
          "Ese {{product}} esta volando, quedan pocas unidades.",
          "",
          "Te cuento rapido:",
          "✅ Precio de Mundial: {{precio}} (antes {{precio_regular}})",
          "✅ Envio GRATIS a toda Colombia",
          "✅ Pago contraentrega (pagas cuando te llega)",
          "✅ Llega en 5 dias",
          "",
          "Te lo aparto? Solo necesito unos daticos 📝"
        ),
      },
    ],
  },
  {
    id: "interes",
    emoji: "🎯",
    title: "CAPTURA DE INTERES",
    subtitle: "Despues de que responden",
    color: SC.blue,
    goal: "Confirmar producto + generar urgencia",
    scripts: [
      {
        label: "Cuando dicen 'si me interesa' o preguntan mas",
        text: lines(
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
        text: lines(
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
    id: "cierre",
    emoji: "🔥",
    title: "CIERRE — PEDIR DATOS",
    subtitle: "El momento clave",
    color: SC.amber,
    goal: "Obtener los 5 datos para crear la orden",
    scripts: [
      {
        label: "⭐ Script de cierre directo (EL MAS IMPORTANTE)",
        text: lines(
          "Perfecto! Te lo aparto ya mismo ✅",
          "",
          "Para enviartelo solo necesito estos datos (copiame y llena):",
          "",
          "📝 Nombre completo:",
          "🏙️ Ciudad:",
          "🏠 Direccion completa:",
          "📱 Numero de contacto:",
          "📧 Correo electronico:",
          "",
          "Apenas me los pases, queda tu pedido confirmado y te llega en 5 dias 🚀"
        ),
      },
      {
        label: "Cierre para combos (especificar productos)",
        text: lines(
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
        label: "Cierre asumido (si ya mostraron interes claro)",
        text: lines(
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
    id: "objeciones",
    emoji: "🛡️",
    title: "MANEJO DE OBJECIONES",
    subtitle: "Cuando dudan o no responden",
    color: SC.purple,
    goal: "Resolver dudas y recuperar el interes",
    scripts: [
      {
        label: '"Es muy caro" / "No tengo plata"',
        text: lines(
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
        text: lines(
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
        text: lines(
          "Dale! Sin presion 🙌",
          "",
          "Solo te aviso que quedan pocas unidades al precio promo de {{precio}} y cuando se acaben vuelven al precio regular de {{precio_regular}}.",
          "",
          "Si quieres, te lo aparto por las proximas 2 horas sin compromiso. Te parece? 🔒"
        ),
      },
      {
        label: '"Hay descuento?" / "Me haces rebaja?"',
        text: lines(
          "El precio ya tiene descuento de Mundial 🏆",
          "",
          "Mira: el precio regular es {{precio_regular}} y lo tenemos a {{precio}} — eso ya es un ahorro de {{ahorro}} 🔥",
          "",
          "Y ademas el envio es GRATIS (eso normalmente vale $15.000-$20.000).",
          "",
          "Es la mejor oferta que vas a encontrar. Te lo aparto? 📦"
        ),
      },
      {
        label: '"Puedo ver fotos?" / "Como es?"',
        text: lines(
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
    id: "followup",
    emoji: "📲",
    title: "FOLLOW-UP",
    subtitle: "Si no responden",
    color: SC.red,
    goal: "Recuperar leads frios sin ser invasivo",
    scripts: [
      {
        label: "Follow-up #1 — 2 horas despues",
        text: lines(
          "Hey! 👋 Vi que estabas interesado/a en el {{product}}.",
          "",
          "Todavia lo tengo disponible al precio promo de {{precio}} 🔥",
          "",
          "Te lo aparto? Solo necesito tus datos y listo 📦"
        ),
      },
      {
        label: "Follow-up #2 — Al dia siguiente",
        text: lines(
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
        text: lines(
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
    id: "confirmacion",
    emoji: "✅",
    title: "CONFIRMACION DE ORDEN",
    subtitle: "Cuando dan los datos",
    color: SC.green,
    goal: "Confirmar, generar confianza y upsell",
    scripts: [
      {
        label: "Confirmacion de pedido",
        text: lines(
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
        label: "Upsell despues de confirmar (opcional)",
        text: lines(
          "Ya quedo tu pedido! 🎉",
          "",
          "Oye, y como ya te hacemos el envio... no quieres agregar otro para alguien?",
          "",
          "🔥 Combo Parceros: agrega otra camiseta por solo $80.000 mas",
          "🔥 Combo Pareja: agrega un body por solo $70.000 mas",
          "",
          "Asi aprovechas el envio gratis 📦 Te animas?"
        ),
      },
    ],
  },
];

const quickRules = [
  { icon: "⚡", title: "Responde en menos de 2 min", desc: "Cada minuto que pasa, la probabilidad de cierre baja un 10%. El lead esta caliente AHORA." },
  { icon: "🎯", title: "Siempre cierra pidiendo datos", desc: 'Nunca termines un mensaje sin una pregunta o un call to action. Nunca digas "cualquier cosa me escribes".' },
  { icon: "🔒", title: 'Usa "te lo aparto"', desc: "Crea urgencia real. El cliente siente que puede perder la oportunidad. Funciona porque es verdad — se agotan." },
  { icon: "💳", title: "Repite CONTRAENTREGA", desc: 'Es tu arma mas poderosa. Elimina el miedo. Repitelo en cada mensaje clave: "pagas cuando te llega".' },
  { icon: "🚫", title: "No negocies precio", desc: "El precio YA tiene descuento. Muestra el ahorro vs precio regular. Si insisten, ofrece combo como alternativa." },
  { icon: "📋", title: "Copia y pega, no improvises", desc: "Los scripts estan disenados para convertir. Personaliza el nombre y producto, pero no cambies la estructura." },
];

const metricsData = [
  { label: "Tasa de respuesta objetivo", value: "< 2 min", color: SC.green },
  { label: "Conversion objetivo", value: "20-30%", color: SC.amber },
  { label: "Follow-ups maximos", value: "3 mensajes", color: SC.blue },
  { label: "Datos necesarios para orden", value: "5 campos", color: SC.purple },
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
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all border ${
        copied
          ? "bg-[#10b981] border-[#10b981] text-white"
          : "bg-white/5 border-white/15 text-slate-400 hover:text-slate-200 hover:border-white/30"
      }`}
    >
      {copied ? "✅ Copiado" : "📋 Copiar"}
    </button>
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

  function startEdit() {
    setEditBuffer(displayText);
    setEditing(true);
  }

  function saveEdit() {
    onDraftChange(draftKey, editBuffer);
    setEditing(false);
  }

  function resetDraft() {
    onDraftChange(draftKey, null);
    setEditing(false);
  }

  return (
    <div className="mb-2.5">
      <button
        onClick={() => { setOpen((o) => !o); if (open) setEditing(false); }}
        className={`w-full text-left flex justify-between items-center px-4 py-3 text-sm font-medium text-slate-200 border border-white/10 transition-colors ${
          open ? "bg-white/[0.06] rounded-t-lg" : "bg-white/[0.03] rounded-lg hover:bg-white/[0.05]"
        }`}
      >
        <span className="pr-3">{script.label}</span>
        <span
          className="text-lg opacity-50 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="bg-black/30 border border-white/10 border-t-0 rounded-b-lg p-4 space-y-3">
          {editing ? (
            <>
              <Textarea
                value={editBuffer}
                onChange={(e) => setEditBuffer(e.target.value)}
                rows={Math.max(6, displayText.split("\n").length + 1)}
                className="text-[13px] leading-relaxed bg-black/20 border-white/20 text-slate-100 resize-none"
                style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={resetDraft}
                  className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2"
                >
                  Restablecer original
                </button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-white/20 text-slate-300 hover:bg-white/10 hover:text-slate-100"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    style={{ background: SC.whatsapp, border: "none" }}
                    onClick={saveEdit}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {hasEdit && (
                <div className="flex items-center gap-2 text-[11px] text-amber-400">
                  <span>✏️ Editado manualmente</span>
                  <button
                    onClick={resetDraft}
                    className="underline underline-offset-2 opacity-70 hover:opacity-100"
                  >
                    Restablecer
                  </button>
                </div>
              )}
              <pre
                className="whitespace-pre-wrap break-words text-[13.5px] leading-[1.7] text-slate-200 m-0 bg-[#25D366]/[0.05] p-4 rounded-md border-l-[3px] border-[#25D366]"
                style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}
              >
                {displayText}
              </pre>
              <div className="flex items-center justify-between">
                <button
                  onClick={startEdit}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  ✏️ Editar texto
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

export function PlaybookVentas({ products }: { products: Product[] }) {
  const [activeStage, setActiveStage] = useState("bienvenida");
  const [activeTab, setActiveTab] = useState("funnel");
  const [selectedId, setSelectedId] = useState<string>(products[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("playbook.selectedProductId");
    if (saved && products.find((p) => p.id === saved)) setSelectedId(saved);
  }, [products]);

  function handleProductChange(id: string | null) {
    if (!id) return;
    setSelectedId(id);
    localStorage.setItem("playbook.selectedProductId", id);
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
    ? selected.promo_active && selected.price_promo
      ? selected.price_promo : selected.sale_price
    : null;

  return (
    <div
      className="bg-[#0a0f1a] min-h-full text-slate-100"
      style={{ fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', sans-serif" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0a0f1a] via-[#1a1a2e] to-[#16213e] border-b border-[#1e293b] px-4 md:px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="text-3xl">🇨🇴</span>
          <div>
            <h1
              className="text-xl font-extrabold tracking-tight m-0"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PLAYBOOK DE VENTAS
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 m-0">
              Shopper Center — Mundial 2026 ⚽
            </p>
          </div>
        </div>
      </div>

      {/* Product picker */}
      <div className="border-b border-[#1e293b] bg-black/20 px-4 md:px-6 py-3">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Producto activo:</span>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Select value={selectedId} onValueChange={handleProductChange}>
              <SelectTrigger className="flex-1 max-w-xs bg-white/5 border-white/15 text-slate-100 h-8 text-sm">
                <SelectValue />
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
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold" style={{ color: SC.green }}>
                  {copStr(displayPrice)}
                </span>
                {selected.promo_active && selected.price_promo && selected.price_regular && (
                  <span className="text-xs text-slate-500 line-through hidden sm:inline">
                    {copStr(selected.price_regular)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-[#1e293b] bg-black/20">
        <div className="max-w-3xl mx-auto flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "funnel", label: "📊 Funnel & Scripts" },
            { id: "reglas", label: "⚡ Reglas de Oro" },
            { id: "metricas", label: "📈 Metricas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-5 py-3.5 text-[13px] font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#f59e0b] text-[#f59e0b]"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-5">

        {/* Funnel tab */}
        {activeTab === "funnel" && (
          <div className="grid gap-5 md:grid-cols-[200px_1fr]">
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-[1.5px] mb-2 pl-1 hidden md:block">
                ETAPAS DEL FUNNEL
              </p>

              {/* Mobile: sticky horizontal pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden sticky top-0 z-10 bg-[#0a0f1a] py-2">
                {funnelStages.map((stage) => {
                  const isActive = activeStage === stage.id;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setActiveStage(stage.id)}
                      style={{
                        borderColor: isActive ? stage.color : "rgba(255,255,255,0.12)",
                        background: isActive ? stage.color + "20" : "rgba(255,255,255,0.03)",
                      }}
                      className="shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border min-w-[68px] transition-colors"
                    >
                      <span className="text-xl leading-none">{stage.emoji}</span>
                      <span
                        className="text-[9px] font-bold tracking-wide whitespace-nowrap uppercase"
                        style={{ color: isActive ? stage.color : "#64748b" }}
                      >
                        {stage.title.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop: sidebar list */}
              <div className="hidden md:flex flex-col gap-2">
                {funnelStages.map((stage) => {
                  const isActive = activeStage === stage.id;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setActiveStage(stage.id)}
                      style={{
                        background: isActive ? stage.color + "18" : "#111827",
                        borderColor: isActive ? stage.color : "#1e293b",
                      }}
                      className="relative w-full text-left rounded-xl border px-4 py-3 transition-all overflow-hidden"
                    >
                      {isActive && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px]"
                          style={{ background: stage.color }}
                        />
                      )}
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-xl leading-none">{stage.emoji}</span>
                        <span
                          className="text-[12px] font-bold tracking-[0.8px]"
                          style={{ color: isActive ? stage.color : "#f1f5f9" }}
                        >
                          {stage.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-[30px] m-0">{stage.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scripts panel */}
            <div className="min-w-0">
              <div
                className="rounded-xl border p-5 mb-4"
                style={{ background: "#111827", borderColor: "#1e293b" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl leading-none">{current.emoji}</span>
                  <div>
                    <h2 className="text-lg font-bold m-0" style={{ color: current.color }}>
                      {current.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 m-0">{current.subtitle}</p>
                  </div>
                </div>
                <div
                  className="mt-3 px-3 py-2 rounded-lg border text-[13px]"
                  style={{ background: current.color + "12", borderColor: current.color + "30" }}
                >
                  <span className="text-[11px] font-bold tracking-[0.5px]" style={{ color: current.color }}>
                    🎯 OBJETIVO:
                  </span>{" "}
                  <span className="text-slate-200">{current.goal}</span>
                </div>
              </div>

              <p className="text-[11px] font-bold text-slate-500 tracking-[1.5px] mb-3">
                SCRIPTS — Click para expandir y copiar
              </p>

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
        )}

        {/* Reglas tab */}
        {activeTab === "reglas" && (
          <div>
            <h2 className="text-lg font-bold mb-5" style={{ color: SC.amber }}>
              ⚡ 6 Reglas de Oro para Cerrar por WhatsApp
            </h2>
            <div className="grid gap-3">
              {quickRules.map((rule, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start rounded-xl border px-5 py-4"
                  style={{ background: "#111827", borderColor: "#1e293b" }}
                >
                  <span className="text-3xl leading-none shrink-0 mt-0.5">{rule.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-200 mb-1 m-0">{rule.title}</p>
                    <p className="text-[13px] text-slate-400 leading-relaxed m-0">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-6 rounded-xl border p-5"
              style={{ background: SC.amber + "10", borderColor: SC.amber + "30" }}
            >
              <h3 className="text-[15px] font-semibold mb-3" style={{ color: SC.amber }}>
                🔄 Flujo de Respuesta Rapida
              </h3>
              <div className="text-[13px] text-slate-400 leading-[1.9]">
                <strong className="text-slate-200">Lead escribe →</strong> Responder menos de 2 min con bienvenida<br />
                <strong className="text-slate-200">Muestra interes →</strong> Dar info del producto + beneficios<br />
                <strong className="text-slate-200">Hace preguntas →</strong> Responder + SIEMPRE cerrar pidiendo datos<br />
                <strong className="text-slate-200">Da los datos →</strong> Confirmar orden + intentar upsell combo<br />
                <strong className="text-slate-200">No responde →</strong> Follow-up #1 (2h) → #2 (24h) → #3 (48h)<br />
                <strong className="text-slate-200">Dice no →</strong> Agradecer + dejar puerta abierta
              </div>
            </div>
          </div>
        )}

        {/* Metricas tab */}
        {activeTab === "metricas" && (
          <div>
            <h2 className="text-lg font-bold mb-5" style={{ color: SC.amber }}>
              📈 Metricas y Objetivos
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {metricsData.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-5 text-center"
                  style={{ background: "#111827", borderColor: "#1e293b" }}
                >
                  <div className="text-2xl font-extrabold mb-1" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl border p-5 mb-4"
              style={{ background: "#111827", borderColor: "#1e293b" }}
            >
              <h3 className="text-[15px] font-semibold text-slate-200 mb-4">
                📊 Como Medir tu Rendimiento
              </h3>
              <div className="text-[13px] text-slate-400 leading-[1.9]">
                <strong style={{ color: SC.green }}>Lleva un conteo diario simple:</strong>
                <br /><br />
                • <strong className="text-slate-200">Leads que llegan:</strong> Cada mensaje nuevo de WhatsApp<br />
                • <strong className="text-slate-200">Leads que responden:</strong> Los que contestan despues de tu bienvenida<br />
                • <strong className="text-slate-200">Datos recibidos:</strong> Los que te pasan nombre, ciudad, direccion<br />
                • <strong className="text-slate-200">Ordenes confirmadas:</strong> Pedidos creados en Dropi<br />
                • <strong className="text-slate-200">Ventas entregadas:</strong> Pedidos que se entregaron con exito<br /><br />
                <strong style={{ color: SC.amber }}>Formula de conversion:</strong>{" "}
                (Ordenes confirmadas / Leads que llegan) x 100<br /><br />
                <strong className="text-slate-200">Ejemplo:</strong> Si llegan 10 leads y cierras 2 = 20% conversion ✅<br />
                <strong className="text-slate-200">Meta:</strong> Con estos scripts deberian llegar a 25-30% 🎯
              </div>
            </div>

            <div
              className="rounded-xl border p-5"
              style={{ background: "#111827", borderColor: "#1e293b" }}
            >
              <h3 className="text-[15px] font-semibold text-slate-200 mb-3">
                💰 Proyeccion con 10 Leads/Dia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {[
                  { label: "Conversion 15%", ventas: "1.5/dia", revenue: "$134.850/dia", color: "#94a3b8" },
                  { label: "Conversion 25%", ventas: "2.5/dia", revenue: "$224.750/dia", color: SC.amber },
                  { label: "Conversion 35%", ventas: "3.5/dia", revenue: "$314.650/dia", color: SC.green },
                ].map((p, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-black/20">
                    <div className="text-[11px] font-bold mb-1.5" style={{ color: p.color }}>{p.label}</div>
                    <div className="text-lg font-extrabold text-slate-200">{p.ventas}</div>
                    <div className="text-xs text-slate-500 mt-0.5">~{p.revenue}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-600 mt-3 text-center m-0">
                *Basado en ticket promedio de $89.900 (producto individual)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

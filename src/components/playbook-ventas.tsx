"use client";

import { useState } from "react";

const COLORS = {
  bg: "#0a0f1a",
  card: "#111827",
  cardHover: "#1a2235",
  accent: "#f59e0b",
  accentDim: "#b45309",
  green: "#10b981",
  greenDim: "#065f46",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  border: "#1e293b",
  whatsapp: "#25D366",
};

interface Script {
  label: string;
  text: string;
}

interface Stage {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  goal: string;
  scripts: Script[];
}

const funnelStages: Stage[] = [
  {
    id: "bienvenida",
    emoji: "👋",
    title: "BIENVENIDA",
    subtitle: "0-2 min después del mensaje",
    color: COLORS.whatsapp,
    goal: "Enganchar + identificar qué producto quiere",
    scripts: [
      {
        label: "Respuesta inicial (cuando preguntan por un producto)",
        text: `¡Hola! 👋 Gracias por escribirnos 🇨🇴

¡Qué bueno que te interesa! Tenemos disponibilidad todavía pero se están agotando rápido 🔥

¿Me cuentas cuál te llamó la atención?
1️⃣ Camiseta Selección Colombia ($89.900)
2️⃣ Body Colombia ($79.900)
3️⃣ Combo Pareja - Camiseta + Body ($159.900)
4️⃣ Combo Parceros - 2 Camisetas ($169.900)
5️⃣ Combo Amigas - 2 Bodys ($149.900)`,
      },
      {
        label: "Si llegan con un producto específico",
        text: `¡Hola! 👋 Excelente elección 🔥

Ese [PRODUCTO] está volando, quedan pocas unidades.

Te cuento rápido:
✅ Precio de Mundial: $[PRECIO_PROMO] (antes $[PRECIO_REGULAR])
✅ Envío GRATIS a toda Colombia
✅ Pago contraentrega (pagas cuando te llega)
✅ Llega en 5 días

¿Te lo aparto? Solo necesito unos daticos 📝`,
      },
    ],
  },
  {
    id: "interes",
    emoji: "🎯",
    title: "CAPTURA DE INTERÉS",
    subtitle: "Después de que responden",
    color: COLORS.blue,
    goal: "Confirmar producto + generar urgencia",
    scripts: [
      {
        label: "Cuando dicen 'sí me interesa' o preguntan más",
        text: `¡Dale! Te cuento por qué este [PRODUCTO] es diferente:

🏆 Es la camiseta/body oficial del Mundial 2026
🇨🇴 Colombia juega el 17 de junio vs Uzbekistán
📦 Te llega en 5 días — justo a tiempo
💰 Precio promo: solo $[PRECIO] (se acaba pronto)
🚚 Envío GRATIS + pagas cuando te llega

Ya hemos enviado más de [X] pedidos esta semana 📦

¿Lo pedimos? Te toma menos de 1 minuto 👇`,
      },
      {
        label: "Cuando preguntan por tallas",
        text: `¡Buena pregunta!

👕 Camiseta: Tenemos S, M, L, XL — corte clásico, cuello en V
👙 Body: Talla única — es elástico y se adapta súper bien

¿Cuál es tu talla? Así te confirmo disponibilidad al toque 🔥`,
      },
    ],
  },
  {
    id: "cierre",
    emoji: "🔥",
    title: "CIERRE — PEDIR DATOS",
    subtitle: "El momento clave",
    color: COLORS.accent,
    goal: "Obtener los 5 datos para crear la orden",
    scripts: [
      {
        label: "⭐ Script de cierre directo (EL MÁS IMPORTANTE)",
        text: `¡Perfecto! Te lo aparto ya mismo ✅

Para enviártelo solo necesito estos datos (cópiame y llena):

📝 Nombre completo:
🏙️ Ciudad:
🏠 Dirección completa:
📱 Número de contacto:
📧 Correo electrónico:

Apenas me los pases, queda tu pedido confirmado y te llega en 5 días 🚀`,
      },
      {
        label: "Cierre para combos (especificar productos)",
        text: `¡Excelente! El [COMBO] es la mejor opción 💪

Para armarte el pedido necesito:

📝 Nombre completo:
🏙️ Ciudad:
🏠 Dirección completa:
📱 Número de contacto:
📧 Correo:
👕 Talla camiseta (si aplica):

Recuerda: pagas cuando te llega. Sin riesgo 💯`,
      },
      {
        label: "Cierre asumido (si ya mostraron interés claro)",
        text: `Ya te lo tengo apartado 🔒

Solo pásame tus datos para generar la guía de envío:

Nombre:
Ciudad:
Dirección:
Teléfono:
Correo:

Lo despacho hoy y te llega en 5 días 📦🇨🇴`,
      },
    ],
  },
  {
    id: "objeciones",
    emoji: "🛡️",
    title: "MANEJO DE OBJECIONES",
    subtitle: "Cuando dudan o no responden",
    color: COLORS.purple,
    goal: "Resolver dudas y recuperar el interés",
    scripts: [
      {
        label: '"Es muy caro" / "No tengo plata"',
        text: `Entiendo 💛 Pero mira esto:

La camiseta original en tienda está a $350.000+
Nosotros la tenemos a $89.900 — menos de la mitad 🤯

Y lo mejor: pagas CUANDO TE LLEGA. No tienes que pagar nada ahora.

Es precio de Mundial, y cuando empiece el torneo suben seguro. ¿Te la aparto?`,
      },
      {
        label: '"¿Es original?" / "¿Es confiable?"',
        text: `¡Claro! Te cuento:

✅ Producto con tecnología AEROREADY
✅ Escudo tejido de la Selección
✅ Envío con guía de rastreo (Servientrega/Coordinadora)
✅ Pagas contraentrega — si no te gusta, no pagas
✅ Ya llevamos [X] pedidos enviados esta semana

0 riesgo para ti. ¿Lo pedimos? 🇨🇴`,
      },
      {
        label: '"Déjame pensarlo" / "Luego te escribo"',
        text: `¡Dale! Sin presión 🙌

Solo te aviso que quedan pocas unidades al precio promo de $[PRECIO] y cuando se acaben vuelven al precio regular de $[PRECIO_REGULAR].

Si quieres, te lo aparto por las próximas 2 horas sin compromiso. ¿Te parece? 🔒`,
      },
      {
        label: '"¿Hay descuento?" / "¿Me haces rebaja?"',
        text: `El precio ya tiene descuento de Mundial 🏆

Mira: el precio regular es $[REGULAR] y lo tenemos a $[PROMO] — eso ya es un ahorro de $[AHORRO] 🔥

Y además el envío es GRATIS (eso normalmente vale $15.000-$20.000).

Es la mejor oferta que vas a encontrar. ¿Te lo aparto? 📦`,
      },
      {
        label: '"¿Puedo ver fotos?" / "¿Cómo es?"',
        text: `¡Claro! Mira 👇

[ENVIAR FOTOS DEL PRODUCTO]

🔥 Es espectacular en persona — las fotos no le hacen justicia

¿Te gusta? ¿Te lo pedimos? 🇨🇴`,
      },
    ],
  },
  {
    id: "followup",
    emoji: "📲",
    title: "FOLLOW-UP",
    subtitle: "Si no responden",
    color: COLORS.red,
    goal: "Recuperar leads fríos sin ser invasivo",
    scripts: [
      {
        label: "Follow-up #1 — 2 horas después",
        text: `Hey! 👋 Vi que estabas interesado/a en el [PRODUCTO].

Todavía lo tengo disponible al precio promo de $[PRECIO] 🔥

¿Te lo aparto? Solo necesito tus datos y listo 📦`,
      },
      {
        label: "Follow-up #2 — Al día siguiente",
        text: `¡Hola de nuevo! 🇨🇴

Solo quería avisarte que el [PRODUCTO] se está agotando — hoy ya van [X] pedidos.

Si todavía lo quieres, me avisas y te lo aparto al precio promo 💛

Recuerda: envío gratis + pagas cuando te llega ✅`,
      },
      {
        label: "Follow-up #3 — 2 días después (último)",
        text: `👋 Último aviso:

El precio promo de $[PRECIO] del [PRODUCTO] se acaba esta semana.

Después vuelve a $[REGULAR].

Si lo quieres, solo dime "va" y te lo aparto en 1 minuto 🔥`,
      },
    ],
  },
  {
    id: "confirmacion",
    emoji: "✅",
    title: "CONFIRMACIÓN DE ORDEN",
    subtitle: "Cuando dan los datos",
    color: COLORS.green,
    goal: "Confirmar, generar confianza y upsell",
    scripts: [
      {
        label: "Confirmación de pedido",
        text: `🎉 ¡PEDIDO CONFIRMADO!

Aquí tu resumen:

📦 Producto: [PRODUCTO]
👕 Talla: [TALLA]
💰 Total: $[PRECIO] (envío GRATIS)
💳 Pago: Contraentrega
📍 Envío a: [CIUDAD]
🕐 Entrega estimada: 5 días hábiles

Te enviaré tu número de guía apenas se despache 📲

¡Gracias por confiar en nosotros! 🇨🇴⚽`,
      },
      {
        label: "Upsell después de confirmar (opcional)",
        text: `¡Ya quedó tu pedido! 🎉

Oye, y como ya te hacemos el envío... ¿no quieres agregar otro para alguien?

🔥 Combo Parceros: agrega otra camiseta por solo $80.000 más
🔥 Combo Pareja: agrega un body por solo $70.000 más

Así aprovechas el envío gratis 📦 ¿Te animas?`,
      },
    ],
  },
];

const quickRules = [
  { icon: "⚡", title: "Responde en menos de 2 min", desc: "Cada minuto que pasa, la probabilidad de cierre baja un 10%. El lead está caliente AHORA." },
  { icon: "🎯", title: "Siempre cierra pidiendo datos", desc: 'Nunca termines un mensaje sin una pregunta o un call to action. Nunca digas "cualquier cosa me escribes".' },
  { icon: "🔒", title: 'Usa "te lo aparto"', desc: "Crea urgencia real. El cliente siente que puede perder la oportunidad. Funciona porque es verdad — se agotan." },
  { icon: "💳", title: "Repite CONTRAENTREGA", desc: 'Es tu arma más poderosa. Elimina el miedo. Repítelo en cada mensaje clave: "pagas cuando te llega".' },
  { icon: "🚫", title: "No negocies precio", desc: "El precio YA tiene descuento. Muestra el ahorro vs precio regular. Si insisten, ofrece combo como alternativa." },
  { icon: "📋", title: "Copia y pega, no improvises", desc: "Los scripts están diseñados para convertir. Personaliza el nombre y producto, pero no cambies la estructura." },
];

const metrics = [
  { label: "Tasa de respuesta objetivo", value: "< 2 min", color: COLORS.green },
  { label: "Conversión objetivo", value: "20-30%", color: COLORS.accent },
  { label: "Follow-ups máximos", value: "3 mensajes", color: COLORS.blue },
  { label: "Datos necesarios para orden", value: "5 campos", color: COLORS.purple },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? COLORS.green : "rgba(255,255,255,0.08)",
        border: "1px solid " + (copied ? COLORS.green : "rgba(255,255,255,0.15)"),
        color: copied ? "#fff" : COLORS.textMuted,
        padding: "6px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
        transition: "all 0.2s",
        letterSpacing: "0.5px",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      {copied ? "✅ Copiado" : "📋 Copiar"}
    </button>
  );
}

function ScriptCard({ script }: { script: Script }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: "10px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          background: open ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: open ? "8px 8px 0 0" : "8px",
          padding: "12px 16px",
          color: COLORS.text,
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 500,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s",
        }}
      >
        <span>{script.label}</span>
        <span style={{ fontSize: "18px", opacity: 0.5, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && (
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "16px",
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontSize: "13.5px",
              lineHeight: 1.7,
              color: "#e2e8f0",
              margin: "0 0 12px 0",
              background: "rgba(37, 211, 102, 0.05)",
              padding: "16px",
              borderRadius: "6px",
              borderLeft: `3px solid ${COLORS.whatsapp}`,
            }}
          >
            {script.text}
          </pre>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <CopyButton text={script.text} />
          </div>
        </div>
      )}
    </div>
  );
}

function StageCard({ stage, isActive, onClick }: { stage: Stage; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: isActive ? stage.color + "18" : COLORS.card,
        border: `1.5px solid ${isActive ? stage.color : COLORS.border}`,
        borderRadius: "10px",
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.25s",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isActive && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: stage.color }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <span style={{ fontSize: "20px" }}>{stage.emoji}</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: isActive ? stage.color : COLORS.text, letterSpacing: "0.8px" }}>
          {stage.title}
        </span>
      </div>
      <div style={{ fontSize: "11px", color: COLORS.textMuted, paddingLeft: "30px" }}>
        {stage.subtitle}
      </div>
    </button>
  );
}

export function PlaybookVentas() {
  const [activeStage, setActiveStage] = useState("bienvenida");
  const [activeTab, setActiveTab] = useState("funnel");
  const current = funnelStages.find((s) => s.id === activeStage)!;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100%", color: COLORS.text, fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0f1a 0%, #1a1a2e 50%, #16213e 100%)", borderBottom: `1px solid ${COLORS.border}`, padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <span style={{ fontSize: "28px" }}>🇨🇴</span>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", background: `linear-gradient(135deg, ${COLORS.accent}, #fbbf24)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              PLAYBOOK DE VENTAS
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: COLORS.textMuted, paddingLeft: "40px" }}>
            Shopper Center — Mundial 2026 ⚽
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex" }}>
          {[
            { id: "funnel", label: "📊 Funnel & Scripts" },
            { id: "reglas", label: "⚡ Reglas de Oro" },
            { id: "metricas", label: "📈 Métricas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
                color: activeTab === tab.id ? COLORS.accent : COLORS.textMuted,
                padding: "14px 20px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 16px" }}>
        {activeTab === "funnel" && (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px" }}>
            {/* Sidebar - Stages */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textMuted, letterSpacing: "1.5px", marginBottom: "4px", paddingLeft: "4px" }}>
                ETAPAS DEL FUNNEL
              </div>
              {funnelStages.map((stage) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  isActive={activeStage === stage.id}
                  onClick={() => setActiveStage(stage.id)}
                />
              ))}
            </div>

            {/* Main Content - Scripts */}
            <div>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "28px" }}>{current.emoji}</span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: current.color }}>
                      {current.title}
                    </h2>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: COLORS.textMuted }}>
                      {current.subtitle}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: "12px", padding: "10px 14px", background: current.color + "12", borderRadius: "8px", border: `1px solid ${current.color}30` }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: current.color, letterSpacing: "0.5px" }}>
                    🎯 OBJETIVO:
                  </span>{" "}
                  <span style={{ fontSize: "13px", color: COLORS.text }}>{current.goal}</span>
                </div>
              </div>

              <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textMuted, letterSpacing: "1.5px", marginBottom: "10px" }}>
                SCRIPTS — Click para expandir y copiar
              </div>
              {current.scripts.map((script, i) => (
                <ScriptCard key={i} script={script} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "reglas" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: COLORS.accent, marginBottom: "20px" }}>
              ⚡ 6 Reglas de Oro para Cerrar por WhatsApp
            </h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {quickRules.map((rule, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "18px 20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "28px", lineHeight: 1 }}>{rule.icon}</span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: COLORS.text, marginBottom: "4px" }}>{rule.title}</div>
                    <div style={{ fontSize: "13px", color: COLORS.textMuted, lineHeight: 1.5 }}>{rule.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "24px", background: `${COLORS.accent}10`, border: `1px solid ${COLORS.accent}30`, borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: COLORS.accent }}>🔄 Flujo de Respuesta Rápida</h3>
              <div style={{ fontSize: "13px", color: COLORS.textMuted, lineHeight: 1.8 }}>
                <strong style={{ color: COLORS.text }}>Lead escribe →</strong> Responder {"<"} 2 min con bienvenida<br />
                <strong style={{ color: COLORS.text }}>Muestra interés →</strong> Dar info del producto + beneficios<br />
                <strong style={{ color: COLORS.text }}>Hace preguntas →</strong> Responder + SIEMPRE cerrar pidiendo datos<br />
                <strong style={{ color: COLORS.text }}>Da los datos →</strong> Confirmar orden + intentar upsell combo<br />
                <strong style={{ color: COLORS.text }}>No responde →</strong> Follow-up #1 (2h) → #2 (24h) → #3 (48h)<br />
                <strong style={{ color: COLORS.text }}>Dice no →</strong> Agradecer + dejar puerta abierta
              </div>
            </div>
          </div>
        )}

        {activeTab === "metricas" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: COLORS.accent, marginBottom: "20px" }}>📈 Métricas y Objetivos</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {metrics.map((m, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: m.color, marginBottom: "6px" }}>{m.value}</div>
                  <div style={{ fontSize: "12px", color: COLORS.textMuted }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", color: COLORS.text }}>📊 Cómo Medir tu Rendimiento</h3>
              <div style={{ fontSize: "13px", color: COLORS.textMuted, lineHeight: 1.8 }}>
                <strong style={{ color: COLORS.green }}>Lleva un conteo diario simple:</strong><br /><br />
                • <strong style={{ color: COLORS.text }}>Leads que llegan:</strong> Cada mensaje nuevo de WhatsApp<br />
                • <strong style={{ color: COLORS.text }}>Leads que responden:</strong> Los que contestan después de tu bienvenida<br />
                • <strong style={{ color: COLORS.text }}>Datos recibidos:</strong> Los que te pasan nombre, ciudad, dirección<br />
                • <strong style={{ color: COLORS.text }}>Órdenes confirmadas:</strong> Pedidos creados en Dropi<br />
                • <strong style={{ color: COLORS.text }}>Ventas entregadas:</strong> Pedidos que se entregaron con éxito<br /><br />
                <strong style={{ color: COLORS.accent }}>Fórmula de conversión:</strong> (Órdenes confirmadas ÷ Leads que llegan) × 100<br /><br />
                <strong style={{ color: COLORS.text }}>Ejemplo:</strong> Si llegan 10 leads y cierras 2 = 20% conversión ✅<br />
                <strong style={{ color: COLORS.text }}>Meta:</strong> Con estos scripts deberían llegar a 25-30% 🎯
              </div>
            </div>

            <div style={{ marginTop: "16px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: COLORS.text }}>💰 Proyección con 10 Leads/Día</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "12px" }}>
                {[
                  { label: "Conversión 15%", ventas: "1.5/día", revenue: "$134,850/día", color: COLORS.textMuted },
                  { label: "Conversión 25%", ventas: "2.5/día", revenue: "$224,750/día", color: COLORS.accent },
                  { label: "Conversión 35%", ventas: "3.5/día", revenue: "$314,650/día", color: COLORS.green },
                ].map((p, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", color: p.color, fontWeight: 700, marginBottom: "6px" }}>{p.label}</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: COLORS.text }}>{p.ventas}</div>
                    <div style={{ fontSize: "12px", color: COLORS.textMuted, marginTop: "2px" }}>~{p.revenue}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "11px", color: COLORS.textMuted, marginTop: "10px", textAlign: "center" }}>
                *Basado en ticket promedio de $89,900 (producto individual)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

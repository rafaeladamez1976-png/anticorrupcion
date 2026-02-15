# 🛡️ Sistema Anticorrupción Sinaloa

Plataforma ciudadana de denuncia anónima contra la corrupción con análisis inteligente de verosimilitud.

## ✨ Características

- **Anonimato Total**: No se almacenan datos personales, IPs ni metadatos identificables
- **IA Integrada**: Chat guiado por inteligencia artificial para estructurar denuncias
- **Scoring Inteligente**: Análisis automático de verosimilitud con señales positivas/negativas
- **Panel Administrativo**: Dashboard con estadísticas, listado y detalle de expedientes
- **Código de Seguimiento**: Código único de 16 caracteres para consultar el estado

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🏗️ Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Supabase** (Auth + Database)
- **Anthropic Claude** (AI Chat)
- **Lucide Icons**
- **Framer Motion**

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── denuncia/page.tsx           # Chat IA para denuncias
│   ├── consulta/page.tsx           # Consulta por código
│   ├── admin/
│   │   ├── login/page.tsx          # Login administrativo
│   │   ├── dashboard/page.tsx      # Panel de control
│   │   └── denuncias/
│   │       ├── page.tsx            # Listado de denuncias
│   │       └── [id]/page.tsx       # Detalle de expediente
│   └── api/
│       ├── ia/chat/route.ts        # API de chat con Claude
│       ├── denuncias/
│       │   ├── crear/route.ts      # Crear denuncia
│       │   └── consultar/route.ts  # Consultar por código
│       └── admin/
│           └── estadisticas/route.ts
├── lib/supabase.ts
└── types.ts
```

## 🔒 Modo Demo

El proyecto incluye un **modo demo** con datos de ejemplo para presentaciones. No requiere Supabase ni API keys para funcionar.

## 📜 Licencia

Proyecto académico - Sistema Anticorrupción Sinaloa

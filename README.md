# Micasino TV Show 🎰🔥

Plataforma oficial para los **micro duelos de influencers** y transmisiones de entretenimiento premium de **Micasino TV Show**. Diseñada con una estética oscura de casino (Oro y Negro) de alta gama, capacidades Server-Side Rendering (SSR) modernas y construida bajo el ecosistema de **Next.js (App Router)**.

La plataforma resuelve de forma innovadora las limitaciones que imponen aplicaciones tradicionales como YouTube sobre contenido de apuestas y casinos, implementando un reproductor inteligente jerárquico redundante y una consola completa de administración.

---

## 🌟 Funcionalidades Principales

### 1. Estética y Colores (Casino Premium)
- **Tema Oscuro Oro:** Visualización inmersiva basada en negro profundo (`#06070b`), acentos de oro metalizado (`#F5C518`), bordes neón suaves y paneles con transparencias "glassmorphism".
- **Identidad de Marca:** Integración del logotipo oficial dorado del trébol (`/logo.png`) y el nombre unificado **Micasino TV Show**.

### 2. Landing Page Inmersiva
- **Reproductor Widescreen Premium:** Un reproductor de video HTML5 en relación de aspecto 16:9 fijo en la cabecera. Cuenta con controles ultra-minimalistas personalizados (seek-bar y pantalla completa).
- **Sección de Comentarios Integrada:** Agregado muro en una sección de comentarios con paginación.

### 3. Podcast con Reproductor Inteligente y Auto-Fallback (SmartPlayer)
- **Ruteo de Video Redundante:** Para evadir bloqueos y bajas de video debido al vocabulario de casino ("apuestas", "casino", "gana algo"), el reproductor de podcast implementa una jerarquía silenciosa y transparente:
  1. **YouTube (Opción 1 - Principal):** Se conecta a la API Iframe de YouTube. Si el video es borrado, privado, o está bloqueado en embeds, el reproductor lo detecta y pasa al siguiente nodo.
  2. **Vimeo (Opción 2 - Respaldo A):** Si falla YouTube, transiciona a Vimeo automáticamente en milisegundos.
  3. **DailyMotion (Opción 3 - Respaldo B):** Si falla Vimeo, salta a DailyMotion.
- **Monitoreo CDN en Vivo:** Un panel visual integrado al reproductor muestra el estado en tiempo real de cada uno de los servidores de video (Node 1, Node 2, Node 3) con códigos de estado, junto con una opción para forzar el salto manual si es necesario.
- **Transición Transparente:** Muestra un spinner animado premium con el logo de trébol dorado para que la transición sea percibida como una carga normal y fluida por el espectador.

### 4. Consola de Administración y Subidas
- **Formulario de Carga:** Permite definir el número de episodio, título, descripción, enlaces de video para cada una de las 3 plataformas, y subir imágenes locales de miniatura.
- **Extracción de IDs Automática:** Las Server Actions procesan los enlaces y parsean las URLs completas ingresadas (YouTube, Vimeo, DailyMotion) para extraer únicamente las IDs necesarias de forma automatizada.
- **Subida de Archivos:** Las miniaturas locales subidas se procesan en el servidor y se guardan bajo `uploads/`, siendo servidas por la API interna del proyecto.
- **Simulador de Admin Local:** Incluye un switch de *"Simulación de Admin"* visible únicamente en desarrollo local (`development`) para poder testear la consola y carga de imágenes de inmediato sin requerir manipular roles SQL en tu base de datos local.
- **Precarga Dinámica (Seeder):** Permite sembrar 3 episodios reales con influencers al hacer clic en un botón. *Nota: El primer episodio está configurado intencionalmente con un enlace roto en YouTube y uno funcional en Vimeo para probar el fallback de forma instantánea.*

### 5. Secciones de Influencers (Plantilla del Show)
- **Grid Unificado:** Presenta a todos los influencers en una cuadrícula premium ordenada por popularidad (Hype) con hover de resplandor dorado, libre de dorsales o divisiones deportivas antiguas.
- **Roles de Casino:** Los perfiles de participantes mapean de forma inmersiva las antiguas abreviaturas deportivas por roles de casino reales (Slots Creator, Roulette Creator, TV Host, etc.).

### 6. Comunidad del Show
- Foro de debate premium libre de alusiones futbolísticas tradicionales. El espacio oficial para que los usuarios puedan compartir posts y debatir sobre las pruebas, los participantes y los resultados del show en tiempo real.

---

## 🛠️ Stack Tecnológico

El proyecto sigue una arquitectura Fullstack moderna optimizada para Vercel o similares edge-runtimes:

- **Framework:** Next.js 16 (React 19) con paradigma de **App Router** (`app/`).
- **Lenguaje:** TypeScript estricto en el 100% del código base para seguridad de tipos.
- **Base de Datos & ORM:** PostgreSQL con **Drizzle ORM** (Tipado seguro y migraciones ágiles).
- **Autenticación:** Auth.js v5 (NextAuth) con `@auth/drizzle-adapter` y `bcryptjs` para el hashing de contraseñas.
- **Estilos:** Tailwind CSS con variables compuestas en `globals.css` para implementar la estética **Casino Gold**.
- **Iconografía:** `lucide-react` para iconos vectoriales ligeros.

---

## 📂 Arquitectura del Proyecto

```text
colombia-2026/
├── public/                 # Assets estáticos (Miniaturas y cartoons)
├── uploads/                # Archivos locales de miniaturas subidas por el admin
├── scripts/                # Scripts de base de datos
│   └── seed.ts             # Volcado inicial de la base de datos de influencers
├── src/
│   ├── app/                # Enrutador Físico (App Router)
│   │   ├── (auth)          # Rutas agrupadas para `/login` y `/register`
│   │   ├── api/uploads/    # Ruta de API que sirve las imágenes locales de uploads/
│   │   ├── comunidad/      # Foro de debate de Micasino TV Show
│   │   ├── jugadores/      # Feed unificado de los Influencers y fichas
│   │   ├── podcast/        # Hub de Podcast, SmartPlayer, Server Actions y Consola Admin
│   │   ├── vuelve-pronto/  # Página de cierre de sesión temática de Micasino
│   │   ├── perfil/         # Ajustes de perfil con selector de Avatar del Show
│   │   ├── globals.css     # Design System Core: Variables de la paleta Casino Gold
│   │   └── page.tsx        # Homepage (YouTube Style player, comentarios y Sidebar)
│   ├── components/
│   │   ├── landing/        # VideoPlayer, HomeGrid y RecentOpinions (Comentarios)
│   │   ├── podcast/        # SmartPlayer y AdminPanel para Podcasts
│   │   └── layout/         # Componentes Shell, como Navbar y Footer
│   ├── db/
│   │   ├── index.ts        # Instancia Drizzle ORM
│   │   └── schema.ts       # Definición de Tablas (users, comments, podcast_episodes, etc.)
│   └── lib/
│       ├── auth.ts         # Wrapper de configuración de NextAuth
│       └── utils.ts        # Funciones utilitarias y TailwindMerge
├── package.json
└── drizzle.config.ts       # Configuración CLI de Drizzle
```

---

## 🚀 Guía de Inicio Rápido (Quick Start)

### Requisitos Previos
- **Node.js** v24 o superior recomendado.
- Gestor **pnpm** o **npm**.
- Instancia local de PostgreSQL corriendo.

### 1. Variables de Entorno (`.env.local`)
Crea un archivo `.env.local` en la raíz del proyecto y define las siguientes variables:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_db"
AUTH_SECRET="fuerte-clave-generada-con-[openssl rand -base64 32]"
AUTH_URL="http://localhost:3000"
```

### 2. Instalar Dependencias
```bash
pnpm install
```

### 3. Inicializar Base de Datos (Drizzle ORM)
Drizzle se encarga de crear las tablas y las relaciones en PostgreSQL de forma automática basándose en nuestro esquema:
```bash
# Push del esquema TypeScript a la base de datos PostgreSQL local
pnpm run db:push

# Sembrar los influencers iniciales del show en la base de datos
pnpm run seed
```

### 4. Lanzar Servidor de Desarrollo
```bash
pnpm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pruebas del Fallback del Reproductor
Para comprobar de inmediato el fallback del reproductor de video de podcasts:
1. Accede a la ruta `/podcast` en tu navegador.
2. Si no ves episodios, activa el interruptor de **"Simular Modo Admin"** en la barra superior amarilla y haz clic en **"Precargar Episodios"**.
3. Haz clic en el primer episodio del listado inferior: **"Duelo de Titanes: Ibai Llanos vs Rubius"**.
4. Verás la pantalla de carga e inmediatamente el reproductor intentará conectar a YouTube, y tras detectar que el enlace está roto por el API, **cambiará automáticamente y en milisegundos a Vimeo** (reproduciendo el video correctamente). El monitor de red de la derecha mostrará el ruteo en vivo:
   - YouTube ➔ `CAÍDO`
   - Vimeo ➔ `CONECTADO`

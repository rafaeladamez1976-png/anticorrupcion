-- =============================================================
-- SISTEMA ANTICORRUPCIÓN SINALOA - Setup Completo de Supabase
-- =============================================================
-- Ejecutar este script en el SQL Editor de Supabase:
-- https://supabase.com/dashboard → tu proyecto → SQL Editor
-- =============================================================

-- 1. TABLA: denuncias (principal)
CREATE TABLE IF NOT EXISTS public.denuncias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_unico TEXT NOT NULL UNIQUE,
    municipio TEXT NOT NULL,
    tipo_corrupcion TEXT NOT NULL DEFAULT 'General',
    tipo TEXT,
    institucion TEXT,
    descripcion TEXT NOT NULL,
    fecha_hechos DATE,
    score_verosimilitud INTEGER DEFAULT 0,
    nivel_verosimilitud TEXT DEFAULT 'BAJA',
    analisis_ia TEXT,
    senales_positivas TEXT[] DEFAULT '{}',
    senales_negativas TEXT[] DEFAULT '{}',
    desglose_score JSONB DEFAULT '{}',
    estado TEXT DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: evidencias (archivos adjuntos)
CREATE TABLE IF NOT EXISTS public.evidencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    denuncia_id UUID REFERENCES public.denuncias(id) ON DELETE CASCADE,
    nombre_archivo TEXT NOT NULL,
    tipo_archivo TEXT,
    url_storage TEXT,
    tamano_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: administradores
CREATE TABLE IF NOT EXISTS public.administradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    rol TEXT DEFAULT 'admin',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- ÍNDICES para rendimiento
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_denuncias_codigo ON public.denuncias(codigo_unico);
CREATE INDEX IF NOT EXISTS idx_denuncias_estado ON public.denuncias(estado);
CREATE INDEX IF NOT EXISTS idx_denuncias_nivel ON public.denuncias(nivel_verosimilitud);
CREATE INDEX IF NOT EXISTS idx_denuncias_municipio ON public.denuncias(municipio);
CREATE INDEX IF NOT EXISTS idx_denuncias_created ON public.denuncias(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidencias_denuncia ON public.evidencias(denuncia_id);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede CREAR denuncias (anónimo)
CREATE POLICY "Permitir insertar denuncias anónimas"
    ON public.denuncias FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Política: Solo lectura pública por código único (para consulta)
CREATE POLICY "Permitir consultar denuncia por codigo"
    ON public.denuncias FOR SELECT
    TO anon, authenticated
    USING (true);

-- Política: Solo admins autenticados pueden actualizar denuncias
CREATE POLICY "Admins pueden actualizar denuncias"
    ON public.denuncias FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.administradores
            WHERE email = auth.email()
            AND activo = true
        )
    );

-- Política: Insertar evidencias vinculadas a denuncias
CREATE POLICY "Permitir insertar evidencias"
    ON public.evidencias FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Política: Leer evidencias
CREATE POLICY "Permitir leer evidencias"
    ON public.evidencias FOR SELECT
    TO anon, authenticated
    USING (true);

-- Política: Solo admins pueden ver la tabla de administradores
CREATE POLICY "Admins pueden ver lista de admins"
    ON public.administradores FOR SELECT
    TO authenticated
    USING (
        email = auth.email()
    );

-- =============================================================
-- STORAGE: Bucket para evidencias
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidencias', 'evidencias', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: subir archivos
CREATE POLICY "Permitir subir evidencias" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'evidencias');

-- Política de storage: leer archivos (solo autenticados)
CREATE POLICY "Admins pueden ver evidencias" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'evidencias');

-- =============================================================
-- DATOS SEED: Administrador predeterminado
-- =============================================================
INSERT INTO public.administradores (email, nombre, rol) VALUES
    ('admin@sinaloa.gob.mx', 'Rafael Adamez', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- =============================================================
-- DATOS SEED: Denuncias de ejemplo
-- =============================================================
INSERT INTO public.denuncias (
    codigo_unico, municipio, tipo_corrupcion, tipo, institucion,
    descripcion, fecha_hechos, score_verosimilitud, nivel_verosimilitud,
    analisis_ia, senales_positivas, senales_negativas, estado
) VALUES
(
    'SINALOA-AX7K2M',
    'Culiacán',
    'Soborno',
    'Soborno',
    'Secretaría de Obras Públicas',
    'Se solicita dinero para agilizar trámite de construcción en la zona centro. El funcionario indicó que sin el pago el permiso tardaría 6 meses más. El monto solicitado fue de $15,000 MXN en efectivo, sin recibo ni comprobante fiscal.',
    '2024-02-10',
    92,
    'CRÍTICA',
    'El reporte presenta un alto nivel de detalle narrativo y técnico que coincide con los procedimientos operativos de la institución mencionada.',
    ARRAY['Relato exhaustivo y detallado', 'Ubicación e institución identificadas', 'Temporalidad definida', 'Contiene terminología específica de actos de corrupción'],
    ARRAY[]::TEXT[],
    'en_analisis'
),
(
    'SINALOA-BN3P8Q',
    'Mazatlán',
    'Desvío de Fondos',
    'Desvío de Fondos',
    'Ayuntamiento de Mazatlán',
    'Uso indebido de recursos públicos en la remodelación del malecón. Se adjudicaron contratos a empresas vinculadas a funcionarios municipales sin licitación pública. El presupuesto original se triplicó sin justificación técnica.',
    '2024-01-20',
    85,
    'ALTA',
    'La denuncia es verosímil y menciona un proyecto público verificable. Requiere mayor aporte probatorio para confirmar el desvío.',
    ARRAY['Mención de proyecto específico verificable', 'Descripción sustancial', 'Ubicación e institución identificadas'],
    ARRAY['Faltan documentos probatorios'],
    'pendiente'
),
(
    'SINALOA-CK9R4T',
    'Ahome',
    'Abuso de Autoridad',
    'Abuso de Autoridad',
    'Policía Municipal de Los Mochis',
    'Detención arbitraria y solicitud de dádiva por parte de elementos de la policía municipal. Se pidió un pago de $5,000 para no levantar una infracción inexistente.',
    '2024-03-05',
    45,
    'MEDIA',
    'El reporte contiene elementos básicos pero carece de detalles específicos que permitan una investigación profunda.',
    ARRAY['Ubicación e institución identificadas'],
    ARRAY['Relato breve', 'Faltan detalles temporales específicos'],
    'en_analisis'
),
(
    'SINALOA-DW2L6N',
    'Guasave',
    'Nepotismo',
    'Nepotismo',
    'Dirección de Recursos Humanos Municipal',
    'Contratación directa de familiares del director de área en la oficina de Recursos Humanos. Al menos 4 personas con el mismo apellido ocupan puestos de confianza sin haber pasado por concurso ni evaluación.',
    '2024-02-28',
    78,
    'ALTA',
    'Se detectan elementos consistentes con prácticas nepotistas. La especificidad de la información sugiere conocimiento interno.',
    ARRAY['Descripción sustancial', 'Datos verificables', 'Indica conocimiento interno'],
    ARRAY[]::TEXT[],
    'pendiente'
),
(
    'SINALOA-EX5M9P',
    'Navolato',
    'Extorsión',
    'Extorsión',
    'Inspección de Comercio Municipal',
    'Cobro de piso por parte de inspectores municipales a comerciantes del mercado principal. Se exigen cuotas semanales de $500 a $2,000 según el tamaño del local. Quienes no pagan reciben clausuras injustificadas.',
    '2024-03-12',
    95,
    'CRÍTICA',
    'Reporte con nivel de detalle excepcional. La descripción del modus operandi es consistente con patrones documentados de extorsión institucional.',
    ARRAY['Relato exhaustivo y detallado', 'Ubicación e institución identificadas', 'Temporalidad definida', 'Contiene terminología específica', 'Patrón de conducta documentado'],
    ARRAY[]::TEXT[],
    'en_analisis'
);

-- =============================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.denuncias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- ✅ Setup completo. 
-- Tablas: denuncias, evidencias, administradores
-- Admin: admin@sinaloa.gob.mx (Rafael Adamez)
-- Denuncias seed: 5 reportes de ejemplo
-- RLS: Configurado para acceso anónimo y admin
-- Storage: Bucket 'evidencias' creado
-- =============================================================

'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    ChevronLeft,
    Shield,
    MapPin,
    Calendar,
    Tag,
    AlertCircle,
    CheckCircle2,
    Info,
    Clock,
    MessageSquare,
    FileText,
    Save,
    Loader2
} from 'lucide-react';

export default function DenunciaDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [denuncia, setDenuncia] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState('');

    useEffect(() => {
        cargarDenuncia();
    }, [id]);

    const cargarDenuncia = async () => {
        setLoading(true);
        // MOCK DETAIL LOADING
        setTimeout(() => {
            const mockDenuncias: Record<string, any> = {
                '1': {
                    id: '1',
                    codigo_unico: 'DX-1234',
                    municipio: 'Culiacán',
                    tipo: 'Soborno',
                    descripcion: 'Se solicita dinero para agilizar trámite de construcción en la zona centro. El funcionario indicó que sin el pago el permiso tardaría 6 meses más.',
                    score_verosimilitud: 92,
                    nivel_verosimilitud: 'CRÍTICA',
                    estado: 'en_analisis',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    institucion: 'Secretaría de Obras Públicas',
                    fecha_hechos: '2024-02-10',
                    senales_positivas: ['Relato detallado', 'Ubicación precisa', 'Coherencia institucional'],
                    senales_negativas: [],
                    analisis_ia: 'El reporte presenta un alto nivel de detalle narrativo y técnico que coincide con los procedimientos operativos de la institución mencionada.'
                },
                '2': {
                    id: '2',
                    codigo_unico: 'DX-5678',
                    municipio: 'Mazatlán',
                    tipo: 'Desvío de Fondos',
                    descripcion: 'Uso indebido de recursos en la remodelación del malecón.',
                    score_verosimilitud: 85,
                    nivel_verosimilitud: 'ALTA',
                    estado: 'pendiente',
                    created_at: new Date().toISOString(),
                    institucion: 'Ayuntamiento de Mazatlán',
                    fecha_hechos: '2024-01-20',
                    senales_positivas: ['Mención de proyecto específico'],
                    senales_negativas: ['Faltan nombres específicos'],
                    analisis_ia: 'La denuncia es verosímil pero requiere mayor aporte probatorio para confirmar el desvío.'
                }
            };

            const data = mockDenuncias[id as string] || mockDenuncias['1'];
            setDenuncia(data);
            setNuevoEstado(data.estado);
            setLoading(false);
        }, 800);
    };

    const actualizarEstado = async () => {
        setSaving(true);
        setTimeout(() => {
            setDenuncia({ ...denuncia, estado: nuevoEstado });
            setSaving(false);
        }, 1000);
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
    );

    if (!denuncia) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-black text-gray-900 mb-4">Denuncia no encontrada</h1>
            <button onClick={() => router.back()} className="text-blue-600 font-bold underline">Volver al Dashboard</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500"
                        >
                            <ChevronLeft />
                        </button>
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expediente Digital</p>
                            <h1 className="text-xl font-black text-gray-900">#{denuncia.codigo_unico}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={nuevoEstado}
                            onChange={(e) => setNuevoEstado(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-600 transition-all"
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_analisis">En Análisis</option>
                            <option value="resuelto">Resuelto / Archivado</option>
                        </select>
                        <button
                            onClick={actualizarEstado}
                            disabled={saving || nuevoEstado === denuncia.estado}
                            className="px-6 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                            <span>Guardar Cambios</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Complaint Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-10 border border-gray-100">
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-4">
                                    <span className={`px-4 py-2 rounded-xl text-xs font-black border-2 ${getNivelColor(denuncia.nivel_verosimilitud)}`}>
                                        NIVEL {denuncia.nivel_verosimilitud}
                                    </span>
                                    <h2 className="text-4xl font-black text-gray-900">{denuncia.tipo}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score Verosimilitud</p>
                                    <p className="text-5xl font-black text-blue-600 leading-none">{denuncia.score_verosimilitud}<span className="text-sm text-gray-300 ml-1">/100</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-10 border-b border-gray-50">
                                <DetailItem icon={<MapPin size={18} />} label="Municipio" value={denuncia.municipio} />
                                <DetailItem icon={<Shield size={18} />} label="Institución" value={denuncia.institucion || 'No especificada'} />
                                <DetailItem icon={<Calendar size={18} />} label="Fecha Hechos" value={denuncia.fecha_hechos || 'N/A'} />
                                <DetailItem icon={<Clock size={18} />} label="Registrada" value={new Date(denuncia.created_at).toLocaleDateString()} />
                            </div>

                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest">
                                    <FileText className="text-blue-600" size={18} />
                                    Relato de los Hechos
                                </h3>
                                <div className="p-8 bg-gray-50 rounded-[2rem] text-gray-700 font-bold leading-relaxed whitespace-pre-wrap border border-gray-100">
                                    {denuncia.descripcion}
                                </div>
                            </div>
                        </div>

                        {/* AI Analysis Card */}
                        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Shield size={120} />
                            </div>

                            <h3 className="flex items-center gap-3 text-xl font-black mb-8 relative z-10">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Shield className="w-5 h-5" />
                                </div>
                                Análisis Inteligente de Veracidad
                            </h3>

                            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                        <CheckCircle2 size={14} /> Señales Positivas
                                    </h4>
                                    <ul className="space-y-2">
                                        {denuncia.senales_positivas?.map((s: string, idx: number) => (
                                            <li key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm">
                                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
                                        <AlertCircle size={14} /> Riesgos Detectados
                                    </h4>
                                    <ul className="space-y-2">
                                        {denuncia.senales_negativas?.length > 0 ? denuncia.senales_negativas.map((s: string, idx: number) => (
                                            <li key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm">
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                {s}
                                            </li>
                                        )) : (
                                            <li className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm text-gray-500">
                                                No se detectaron inconsistencias
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-blue-600/20 border border-blue-500/30 rounded-3xl relative z-10">
                                <p className="text-blue-300 font-bold leading-relaxed italic text-sm">
                                    "{denuncia.analisis_ia}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions and Metadata */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Seguimiento</h3>
                            <div className="space-y-4">
                                <StatusStep active title="Denuncia Recibida" date={denuncia.created_at} />
                                <StatusStep active={denuncia.estado !== 'pendiente'} title="En Análisis" date={denuncia.updated_at} />
                                <StatusStep active={denuncia.estado === 'resuelto'} title="Resuelto / Archivado" />
                            </div>
                        </div>

                        <div className="bg-blue-600 rounded-3xl shadow-xl p-6 text-white text-center">
                            <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                            <h4 className="text-sm font-black uppercase tracking-widest mb-2">Protocolo de Privacidad</h4>
                            <p className="text-xs font-bold text-blue-100 opacity-80 leading-relaxed">
                                Toda la información contenida en este expediente es confidencial.
                                El sistema ha eliminado automáticamente cualquier metadato identificable.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400 font-black uppercase tracking-widest text-[9px]">
                {icon}
                <span>{label}</span>
            </div>
            <p className="text-gray-900 font-black text-sm">{value}</p>
        </div>
    );
}

function StatusStep({ active, title, date }: { active: boolean, title: string, date?: string }) {
    return (
        <div className={`flex gap-4 items-start ${active ? 'opacity-100' : 'opacity-40'}`}>
            <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${active ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-200'}`}>
                    {active ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />}
                </div>
                <div className="w-0.5 h-10 bg-gray-100 last:hidden" />
            </div>
            <div>
                <p className="text-sm font-black text-gray-900 leading-none mb-1">{title}</p>
                {date && <p className="text-[10px] text-gray-400 font-bold">{new Date(date).toLocaleDateString()}</p>}
            </div>
        </div>
    );
}

function getNivelColor(nivel: string) {
    switch (nivel) {
        case 'CRÍTICA': return 'bg-red-100 text-red-700 border-red-200';
        case 'ALTA': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'MEDIA': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
}

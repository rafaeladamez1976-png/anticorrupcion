'use client';
import { useState } from 'react';
import { Search, Shield, ChevronLeft, MapPin, Calendar, Tag, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConsultaPage() {
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [denuncia, setDenuncia] = useState<any>(null);
    const [error, setError] = useState('');

    const handleConsultar = async () => {
        if (!codigo.trim() || loading) return;

        setLoading(true);
        setError('');
        setDenuncia(null);

        try {
            const response = await fetch(`/api/denuncias/consultar?codigo=${codigo}`);
            if (!response.ok) throw new Error('No se encontró ninguna denuncia con este código.');

            const data = await response.json();
            setDenuncia(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            <div className="w-full bg-[#0f172a] p-6 pb-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto flex justify-between items-center relative z-10">
                    <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white font-bold transition-all">
                        <ChevronLeft size={20} />
                        <span>Volver al Inicio</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-500" />
                        <h1 className="text-xl font-black text-white">Sinaloa Anticorrupción</h1>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mt-12 text-center relative z-10">
                    <h2 className="text-4xl font-black text-white mb-4">Consultar Estado de Denuncia</h2>
                    <p className="text-blue-200 font-bold opacity-80 uppercase tracking-widest text-xs">
                        Ingrese su código único de 16 caracteres para verificar el progreso
                    </p>
                </div>
            </div>

            <div className="w-full max-w-2xl -mt-10 px-4 relative z-20">
                <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 border border-white">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-lg font-black tracking-widest text-center text-blue-900 focus:bg-white focus:border-blue-600 transition-all outline-none uppercase"
                            />
                        </div>
                        <button
                            onClick={handleConsultar}
                            disabled={loading || !codigo.trim()}
                            className="px-8 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Consultar'}
                        </button>
                    </div>
                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-600 font-bold text-sm px-4">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {denuncia && (
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`p-6 bg-gradient-to-r ${getStatusColor(denuncia.estado).bg} flex justify-between items-center`}>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Estado Actual</span>
                                <p className={`text-xl font-black ${getStatusColor(denuncia.estado).text}`}>{denuncia.estado.toUpperCase().replace('_', ' ')}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black text-xs">
                                Código: {denuncia.codigo_unico}
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <InfoItem icon={<MapPin size={18} />} label="Municipio" value={denuncia.municipio} />
                                <InfoItem icon={<Tag size={18} />} label="Tipo de Denuncia" value={denuncia.tipo} />
                                <InfoItem icon={<Calendar size={18} />} label="Fecha de Registro" value={new Date(denuncia.created_at).toLocaleDateString()} />
                                <InfoItem icon={<Shield size={18} />} label="Institución" value={denuncia.institucion || 'No especificada'} />
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Análisis de Verosimilitud</h4>
                                <div className="flex items-end gap-4 mb-6">
                                    <span className="text-5xl font-black text-gray-900 leading-none">{denuncia.score_verosimilitud}</span>
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-tighter mb-1">Puntos / 100</span>
                                    <div className="ml-auto">
                                        <span className={`px-4 py-2 rounded-xl text-xs font-black border-2 ${getNivelColor(denuncia.nivel_verosimilitud)}`}>
                                            NIVEL {denuncia.nivel_verosimilitud}
                                        </span>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-1000`}
                                        style={{ width: `${denuncia.score_verosimilitud}%` }}
                                    />
                                </div>
                                <p className="mt-4 text-sm text-gray-500 font-bold leading-relaxed">
                                    Este score es generado automáticamente por nuestro motor de inteligencia para ayudar a las autoridades a priorizar los casos con mayor fundamento técnico. Su denuncia continúa bajo revisión.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-10 mb-20 text-center">
                    <p className="text-xs text-gray-400 font-bold leading-relaxed">
                        ¿Olvidó su código? Por razones de seguridad extrema y anonimato,<br />
                        no existe una base de datos de recuperación de códigos.
                    </p>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600/60 font-black uppercase tracking-widest text-[9px]">
                {icon}
                <span>{label}</span>
            </div>
            <p className="text-gray-900 font-black">{value}</p>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'pendiente': return { bg: 'from-gray-400 to-gray-500', text: 'text-white' };
        case 'en_analisis': return { bg: 'from-blue-500 to-blue-600', text: 'text-white' };
        case 'resuelto': return { bg: 'from-green-500 to-green-600', text: 'text-white' };
        default: return { bg: 'from-gray-400 to-gray-500', text: 'text-white' };
    }
}

function getNivelColor(nivel: string) {
    switch (nivel) {
        case 'CRÍTICA': return 'bg-red-50 text-red-700 border-red-100';
        case 'ALTA': return 'bg-orange-50 text-orange-700 border-orange-100';
        case 'MEDIA': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
}

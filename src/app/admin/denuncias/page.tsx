'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield,
    Search,
    Filter,
    LayoutDashboard,
    ListTodo,
    PieChart,
    LogOut,
    ChevronRight,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Clock,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { DenunciaCompleta } from '@/types';
import { supabase } from '@/lib/supabase';

export default function DenunciasListPage() {
    const [denuncias, setDenuncias] = useState<DenunciaCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroNivel, setFiltroNivel] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const router = useRouter();

    useEffect(() => {
        cargarDatosMock();
    }, []);

    const cargarDatosMock = () => {
        setDenuncias([
            {
                id: '1',
                codigo_unico: 'DX-1234',
                municipio: 'Culiacán',
                tipo: 'Soborno',
                descripcion: 'Se solicita dinero para agilizar trámite de construcción.',
                score_verosimilitud: 92,
                nivel_verosimilitud: 'CRÍTICA',
                estado: 'en_analisis',
                created_at: new Date().toISOString()
            },
            {
                id: '2',
                codigo_unico: 'DX-5678',
                municipio: 'Mazatlán',
                tipo: 'Desvío de Fondos',
                descripcion: 'Uso indebido de recursos públicos en obra municipal.',
                score_verosimilitud: 85,
                nivel_verosimilitud: 'ALTA',
                estado: 'pendiente',
                created_at: new Date().toISOString()
            },
            {
                id: '3',
                codigo_unico: 'DX-9012',
                municipio: 'Ahome',
                tipo: 'Abuso de Autoridad',
                descripcion: 'Detención arbitraria y solicitud de dádiva.',
                score_verosimilitud: 45,
                nivel_verosimilitud: 'MEDIA',
                estado: 'en_analisis',
                created_at: new Date().toISOString()
            },
            {
                id: '4',
                codigo_unico: 'DX-1122',
                municipio: 'Guasave',
                tipo: 'Nepotismo',
                descripcion: 'Contratación directa de familiares en oficina local.',
                score_verosimilitud: 78,
                nivel_verosimilitud: 'ALTA',
                estado: 'pendiente',
                created_at: new Date().toISOString()
            },
            {
                id: '5',
                codigo_unico: 'DX-3344',
                municipio: 'Navolato',
                tipo: 'Extorsión',
                descripcion: 'Cobro de piso por parte de inspectores.',
                score_verosimilitud: 95,
                nivel_verosimilitud: 'CRÍTICA',
                estado: 'en_analisis',
                created_at: new Date().toISOString()
            }
        ]);
        setLoading(false);
    };

    const cerrarSesion = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const denunciasFiltradas = denuncias.filter(d => {
        const matchesBusqueda = d.codigo_unico?.toLowerCase().includes(busqueda.toLowerCase()) ||
            d.municipio.toLowerCase().includes(busqueda.toLowerCase()) ||
            d.tipo.toLowerCase().includes(busqueda.toLowerCase());

        const matchesFiltro = filtroNivel === 'todas' || d.nivel_verosimilitud === filtroNivel;

        return matchesBusqueda && matchesFiltro;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-[#0f172a] text-white flex flex-col p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black leading-tight">Sinaloa <span className="text-blue-500">Admin</span></h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Plataforma Anticorrupción</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <SidebarLink href="/admin/denuncias" icon={<ListTodo size={20} />} label="Listado Denuncias" active />
                    <SidebarLink href="#" icon={<PieChart size={20} />} label="Estadísticas" />
                </nav>

                <div className="pt-6 border-t border-gray-800">
                    <button
                        onClick={cerrarSesion}
                        className="flex items-center gap-3 text-gray-400 font-bold hover:text-red-400 transition-colors w-full px-4 py-3 rounded-xl hover:bg-red-500/10"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-1">Listado de Denuncias</h2>
                        <p className="text-gray-500 font-bold">Gestión y seguimiento de reportes ciudadanos</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex flex-col items-end px-4 border-r border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Logged In</span>
                            <span className="text-sm font-bold text-gray-900">Rafael Adamez</span>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-blue-600">
                            RA
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por código, municipio o tipo..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 transition-all outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                                {['todas', 'CRÍTICA', 'ALTA', 'MEDIA'].map((nivel) => (
                                    <button
                                        key={nivel}
                                        onClick={() => setFiltroNivel(nivel)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtroNivel === nivel
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {nivel === 'todas' ? 'Todas' : nivel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-50 text-left">
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Folio</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Información del Caso</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 font-bold">Cargando reportes...</td></tr>
                                ) : denunciasFiltradas.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 font-bold">No se encontraron resultados para los filtros aplicados.</td></tr>
                                ) : (
                                    denunciasFiltradas.map((d) => (
                                        <tr key={d.id} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="py-6 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${d.estado === 'pendiente' ? 'bg-orange-400 animate-pulse' : 'bg-blue-400'}`} />
                                                    <span className="font-mono font-black text-gray-900 text-sm tracking-tighter">{d.codigo_unico}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1 ml-5">
                                                    {new Date(d.created_at || '').toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="py-6 px-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${getNivelMetadata(d.nivel_verosimilitud || '').color}`}>
                                                        {d.nivel_verosimilitud}
                                                    </span>
                                                    <p className="text-gray-900 font-black text-sm">{d.tipo}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 font-bold truncate max-w-xs">{d.municipio} — {d.descripcion}</p>
                                            </td>
                                            <td className="py-6 px-4 text-center">
                                                <div className="inline-flex flex-col items-center justify-center w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                                    <span className="text-base font-black text-gray-900 leading-none">{d.score_verosimilitud}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 text-center">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${d.estado === 'pendiente' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {d.estado?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4 text-right">
                                                <button
                                                    onClick={() => router.push(`/admin/denuncias/${d.id}`)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all group/btn shadow-sm"
                                                >
                                                    <span>Ver Expediente</span>
                                                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            <span className={active ? 'text-white' : 'group-hover:text-blue-500 transition-colors'}>
                {icon}
            </span>
            <span>{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
        </Link>
    );
}

function getNivelMetadata(nivel: string) {
    switch (nivel) {
        case 'CRÍTICA': return { color: 'bg-red-50 text-red-700 border-red-100' };
        case 'ALTA': return { color: 'bg-orange-50 text-orange-700 border-orange-100' };
        case 'MEDIA': return { color: 'bg-yellow-50 text-yellow-700 border-yellow-100' };
        default: return { color: 'bg-blue-50 text-blue-700 border-blue-100' };
    }
}

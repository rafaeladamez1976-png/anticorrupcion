'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    AlertCircle,
    Search,
    Filter,
    LayoutDashboard,
    ListTodo,
    PieChart,
    LogOut,
    Shield,
    ChevronRight,
    Clock,
    ExternalLink,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { DenunciaCompleta } from '@/types';

interface Estadisticas {
    total: number;
    criticas: number;
    altas: number;
    enAnalisis: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Estadisticas | null>(null);
    const [denuncias, setDenuncias] = useState<DenunciaCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroNivel, setFiltroNivel] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const router = useRouter();

    useEffect(() => {
        // MOCK AUTH BYPASS
        setLoading(false);
        cargarDatosMock();
    }, []);

    const cargarDatosMock = () => {
        setStats({
            total: 12,
            criticas: 3,
            altas: 5,
            enAnalisis: 4
        });

        setDenuncias([
            {
                id: '1',
                codigo_unico: 'DX-1234',
                municipio: 'Culiacán',
                tipo: 'Soborno',
                descripcion: 'Test mock 1',
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
                descripcion: 'Test mock 2',
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
                descripcion: 'Test mock 3',
                score_verosimilitud: 45,
                nivel_verosimilitud: 'MEDIA',
                estado: 'en_analisis',
                created_at: new Date().toISOString()
            }
        ]);
        setLoading(false);
    };

    const verificarAuth = async () => {
        setLoading(false);
        cargarDatosMock();
    };

    const cargarDatos = async () => {
        cargarDatosMock();
    };

    const cerrarSesion = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const denunciasFiltradas = denuncias.filter(d =>
        d.codigo_unico?.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.municipio.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.tipo.toLowerCase().includes(busqueda.toLowerCase())
    );

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
                    <SidebarLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <SidebarLink href="/admin/denuncias" icon={<ListTodo size={20} />} label="Listado Denuncias" />
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
                        <h2 className="text-3xl font-black text-gray-900 mb-1">Panel de Control</h2>
                        <p className="text-gray-500 font-bold">Bienvenido al sistema de priorización inteligente</p>
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatsCard label="Total Denuncias" value={stats?.total || 0} icon={<BarChart3 className="text-blue-600" />} color="blue" />
                    <StatsCard label="Casos Críticos" value={stats?.criticas || 0} icon={<AlertCircle className="text-red-600" />} color="red" />
                    <StatsCard label="Prioridad Alta" value={stats?.altas || 0} icon={<Clock className="text-orange-600" />} color="orange" />
                    <StatsCard label="En Análisis" value={stats?.enAnalisis || 0} icon={<Filter className="text-yellow-600" />} color="yellow" />
                </div>

                {/* Filters and Table */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <h3 className="text-2xl font-black text-gray-900">📋 Reportes Prioritarios</h3>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por código o municipio..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 transition-all outline-none"
                                />
                            </div>
                            <select
                                value={filtroNivel}
                                onChange={(e) => setFiltroNivel(e.target.value)}
                                className="px-6 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-700 outline-none focus:border-blue-600"
                            >
                                <option value="todas">Todos los niveles</option>
                                <option value="CRÍTICA">Críticos</option>
                                <option value="ALTA">Alta</option>
                                <option value="MEDIA">Media</option>
                                <option value="BAJA">Baja</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-50 text-left">
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Código</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Municipio / Tipo</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Nivel</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 font-bold">Cargando datos...</td></tr>
                                ) : denunciasFiltradas.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 font-bold">No se encontraron denuncias.</td></tr>
                                ) : (
                                    denunciasFiltradas.map((d) => (
                                        <tr key={d.id} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="py-6 px-4">
                                                <span className="font-mono font-black text-blue-600 text-sm tracking-tighter">#{d.codigo_unico}</span>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1">Registrado en: Sinaloa</p>
                                            </td>
                                            <td className="py-6 px-4">
                                                <p className="text-gray-900 font-black text-sm">{d.municipio}</p>
                                                <p className="text-xs text-gray-500 font-bold">{d.tipo}</p>
                                            </td>
                                            <td className="py-6 px-4 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-lg font-black text-gray-900 leading-none">{d.score_verosimilitud}</span>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">/ 100</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 text-center">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border-2 ${getNivelMetadata(d.nivel_verosimilitud || '').color}`}>
                                                    {d.nivel_verosimilitud}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4 text-right">
                                                <button
                                                    onClick={() => router.push(`/admin/denuncias/${d.id}`)}
                                                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <ChevronRight />
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

function StatsCard({ label, value, icon, color }: { label: string, value: number, icon: any, color: string }) {
    const bgStyles: any = {
        blue: 'bg-blue-50 border-blue-100',
        red: 'bg-red-50 border-red-100',
        orange: 'bg-orange-50 border-orange-100',
        yellow: 'bg-yellow-50 border-yellow-100',
    };

    return (
        <div className={`${bgStyles[color]} border-2 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group hover:shadow-lg transition-all`}>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-4xl font-black text-gray-900 leading-none">{value}</p>
            </div>
        </div>
    );
}

function getNivelMetadata(nivel: string) {
    switch (nivel) {
        case 'CRÍTICA': return { color: 'bg-red-100 text-red-700 border-red-200' };
        case 'ALTA': return { color: 'bg-orange-100 text-orange-700 border-orange-200' };
        case 'MEDIA': return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        default: return { color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
}

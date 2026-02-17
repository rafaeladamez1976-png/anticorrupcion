import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Total Denuncias
        const { count: total, error: e1 } = await supabase
            .from('denuncias')
            .select('*', { count: 'exact', head: true });

        // 2. Casos Críticos (Nivel CRÍTICA)
        const { count: criticas, error: e2 } = await supabase
            .from('denuncias')
            .select('*', { count: 'exact', head: true })
            .eq('nivel_verosimilitud', 'CRÍTICA');

        // 3. Prioridad Alta (Nivel ALTA o CRÍTICA)
        const { count: alta, error: e3 } = await supabase
            .from('denuncias')
            .select('*', { count: 'exact', head: true })
            .in('nivel_verosimilitud', ['ALTA', 'CRÍTICA']);

        // 4. En Análisis (Estado en_analisis)
        const { count: enAnalisis, error: e4 } = await supabase
            .from('denuncias')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'en_analisis');

        if (e1 || e2 || e3 || e4) throw new Error('Error fetching stats');

        return NextResponse.json({
            total: total || 0,
            criticas: criticas || 0,
            alta: alta || 0,
            enAnalisis: enAnalisis || 0
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}

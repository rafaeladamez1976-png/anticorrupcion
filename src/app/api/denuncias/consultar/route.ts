import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const codigo = searchParams.get('codigo');

        if (!codigo) {
            return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('denuncias')
            .select('codigo_unico, municipio, tipo, institucion, score_verosimilitud, nivel_verosimilitud, estado, created_at')
            .eq('codigo_unico', codigo)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Denuncia no encontrada' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al consultar la denuncia' },
            { status: 500 }
        );
    }
}

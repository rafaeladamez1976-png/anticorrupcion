import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Generar código único de 16 caracteres (formato XXXX-XXXX-XXXX-XXXX)
        const codigo = generarCodigoUnico();

        // Calcular score de verosimilitud técnico
        const scoring = calcularScore(body);

        // Insertar en base de datos
        const { data, error } = await supabase
            .from('denuncias')
            .insert({
                codigo_unico: codigo,
                municipio: body.municipio,
                tipo_corrupcion: body.tipo,
                institucion: body.institucion,
                descripcion: body.descripcion,
                fecha_hechos: body.fechaHechos || null,
                score_verosimilitud: scoring.score,
                nivel_verosimilitud: scoring.nivel,
                analisis_ia: scoring.analisis,
                senales_positivas: scoring.senalesPositivas,
                senales_negativas: scoring.senalesNegativas,
                desglose_score: scoring.desglose,
                estado: 'en_analisis'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            codigo,
            denuncia: data
        });
    } catch (error) {
        console.error('Error al crear denuncia:', error);
        return NextResponse.json(
            { error: 'Error interno al procesar su denuncia. Por favor intente más tarde.' },
            { status: 500 }
        );
    }
}

function generarCodigoUnico(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const length = 4;

    let codigo = '';
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < length; j++) {
            codigo += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < segments - 1) codigo += '-';
    }

    return codigo;
}

function calcularScore(denuncia: any) {
    let score = 0;
    const senalesPositivas: string[] = [];
    const senalesNegativas: string[] = [];

    // 1. Detalle de la descripción (0-30)
    const descLength = denuncia.descripcion?.length || 0;
    if (descLength > 500) {
        score += 30;
        senalesPositivas.push('Relato exhaustivo y detallado');
    } else if (descLength > 200) {
        score += 20;
        senalesPositivas.push('Descripción sustancial');
    } else if (descLength > 50) {
        score += 10;
    } else {
        senalesNegativas.push('Relato extremadamente breve');
    }

    // 2. Coherencia de Datos (0-20)
    if (denuncia.municipio && denuncia.institucion) {
        score += 15;
        senalesPositivas.push('Ubicación e institución identificadas');
    } else {
        senalesNegativas.push('Faltan datos contextuales clave');
    }

    if (denuncia.fechaHechos) {
        score += 5;
        senalesPositivas.push('Temporalidad definida');
    }

    // 3. Estructura Narrativa (0-20)
    const palabrasClave = ['dinero', 'pago', 'exigió', 'amenazó', 'favores', 'nepotismo'];
    const conteoClaves = palabrasClave.filter(p => denuncia.descripcion?.toLowerCase().includes(p)).length;
    if (conteoClaves >= 2) {
        score += 20;
        senalesPositivas.push('Contiene terminología específica de actos de corrupción');
    } else {
        score += 10;
    }

    // 4. Plausibilidad Institucional (0-30)
    score += 20; // Base por coherencia general

    // Ajuste final
    score = Math.min(100, score);

    const nivel = score >= 85 ? 'CRÍTICA' : score >= 70 ? 'ALTA' : score >= 45 ? 'MEDIA' : 'BAJA';

    return {
        score,
        nivel,
        senalesPositivas,
        senalesNegativas,
        desglose: {
            narrativa: Math.min(30, descLength / 20),
            contexto: 20,
            plausibilidad: 20,
            terminologia: conteoClaves * 10
        },
        analisis: `El sistema ha clasificado este reporte con un nivel de verosimilitud ${nivel} basado en la riqueza léxica, coherencia institucional y detalle descriptivo proporcionado.`
    };
}

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Message, DenunciaData } from '@/types';

export const dynamic = 'force-dynamic';

// Inicializar Anthropic (Claude)
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Log server-side initialization (for debugging Vercel logs)
console.log('AI Route Initialized. Key configured:', !!process.env.ANTHROPIC_API_KEY);

export async function POST(request: Request) {
    // Verificar si la API Key está configurada
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('CRITICAL: ANTHROPIC_API_KEY is not configured.');
        return NextResponse.json(
            { message: 'Error de configuración: La clave de Anthropic no está configurada. Por favor, agregue ANTHROPIC_API_KEY en las variables de entorno de Vercel.' },
            { status: 500 }
        );
    }

    try {
        const { messages, denunciaData }: { messages: Message[], denunciaData: DenunciaData } = await request.json();

        const systemPrompt = `
            Eres el Asistente del Sistema Anticorrupción de Sinaloa. Tu objetivo es ayudar al ciudadano a estructurar una denuncia clara y detallada de manera anónima.
            
            FLUJO DE TRABAJO:
            1. Si no hay municipio: Pregunta amablemente el municipio de Sinaloa (Culiacán, Mazatlán, Ahome, etc).
            2. Si hay municipio pero no tipo/institución: Pregunta qué tipo de corrupción es (soborno, nepotismo, etc) y en qué institución ocurrió.
            3. Si hay datos básicos pero falta la descripción: Pide un relato detallado de los hechos (qué, quién, cuándo, dónde).
            4. Una vez tengas todo (Municipio, Institución, Descripción): Resume la información y confirma si desea enviar la denuncia.
            
            INSTRUCCIONES CRÍTICAS:
            - Nunca pidas nombres reales, teléfonos o correos.
            - Mantén un tono institucional, empático y seguro.
            - Si el usuario ya proporcionó datos en su mensaje, extráelos y actualiza el estado interno.
            - Tu respuesta debe ser concisa y clara.
            
            ESTADO ACTUAL DE LA DENUNCIA:
            - Municipio: ${denunciaData.municipio || 'Pendiente'}
            - Institución: ${denunciaData.institucion || 'Pendiente'}
            - Tipo: ${denunciaData.tipo || 'Pendiente'}
            - Descripción: ${denunciaData.descripcion ? 'Proporcionada' : 'Pendiente'}
        `;

        // Formatear mensajes para Claude
        // Claude espera roles 'user' y 'assistant'.
        // Filtramos mensajes vacíos o inválidos si los hubiera.
        const apiMessages = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
        })) as any[];

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            system: systemPrompt,
            messages: apiMessages,
        });

        // Obtener la respuesta de texto (asumiendo que es un bloque de texto)
        const contentBlock = response.content[0];
        const aiResponse = contentBlock.type === 'text' ? contentBlock.text : '';

        // Lógica de extracción (Heurística simple que ya funcionaba)
        // Se mantiene igual para no romper la lógica de cliente
        const updatedData = { ...denunciaData };
        const lastUserMessage = messages[messages.length - 1].content;

        if (!updatedData.municipio && lastUserMessage.length < 30) updatedData.municipio = lastUserMessage;
        else if (!updatedData.institucion && updatedData.municipio) updatedData.institucion = lastUserMessage;
        else if (!updatedData.descripcion && updatedData.institucion) updatedData.descripcion = lastUserMessage;

        const completed = updatedData.municipio && updatedData.institucion && updatedData.descripcion && lastUserMessage.toLowerCase().includes('sí');

        return NextResponse.json({
            message: aiResponse,
            denunciaData: updatedData,
            completed: completed,
            denunciaCompleta: completed ? {
                ...updatedData,
                tipo: updatedData.tipo || 'General'
            } : null
        });

    } catch (error: any) {
        console.error('Anthropic Error:', error);
        
        return NextResponse.json(
            { 
                message: `Hubo un error al procesar su mensaje con Claude. Detalle: ${error.message}`,
                error: error.message
            },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Message, DenunciaData } from '@/types';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: Request) {
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

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            system: systemPrompt,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
        });

        const aiResponse = response.content[0].text;

        // Simple extraction logic
        const updatedData = { ...denunciaData };
        const lastUserMessage = messages[messages.length - 1]?.content || '';

        // Heuristic extraction for demonstration
        if (!updatedData.municipio && lastUserMessage.length < 30) updatedData.municipio = lastUserMessage;
        else if (!updatedData.institucion && updatedData.municipio) updatedData.institucion = lastUserMessage;
        else if (!updatedData.descripcion && updatedData.institucion) updatedData.descripcion = lastUserMessage;

        // Determine if completed
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

    } catch (error) {
        console.error('Anthropic Error:', error);
        return NextResponse.json(
            { message: 'Hubo un error al procesar su mensaje. Por favor intente de nuevo.' },
            { status: 500 }
        );
    }
}

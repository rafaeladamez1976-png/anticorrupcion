import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { messages, denunciaData } = await req.json();

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            system: `Eres un asistente experto en recibir denuncias de corrupción de forma anónima para el estado de Sinaloa.
      Tu objetivo es guiar al ciudadano para obtener información CLAVE:
      1. Municipio 
      2. Tipo de corrupción (soborno, nepotismo, desvío de fondos, etc)
      3. Institución involucrada
      4. Descripción detallada de los hechos
      5. Fecha aproximada
      
      Reglas:
      - Sé empático, profesional y directo.
      - NO pidas datos personales (nombre, teléfono, etc).
      - Si ya tienes toda la información necesaria, finaliza agradeciendo y diciendo que procesarás el reporte.
      - Responde siempre en formato JSON con esta estructura:
      {
        "message": "tu respuesta al usuario",
        "denunciaData": { "municipio": "...", "tipo": "...", "institucion": "...", "descripcion": "...", "fechaHechos": "..." },
        "completed": true/false
      }`,
            messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
        });

        // Safe extraction of text from content blocks
        const aiResponse = response.content
            .filter((block): block is Anthropic.TextBlock => block.type === 'text')
            .map(block => block.text)
            .join(' ');

        // Intentar parsear si la IA respondió con el JSON solicitado
        try {
            const parsed = JSON.parse(aiResponse);
            return NextResponse.json(parsed);
        } catch (e) {
            // Si no es JSON puro, devolver como mensaje normal (fallback)
            return NextResponse.json({
                message: aiResponse,
                denunciaData: denunciaData,
                completed: false
            });
        }

    } catch (error) {
        console.error('Anthropic API Error:', error);
        return NextResponse.json({ error: 'Error en el servicio de IA' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, DenunciaData } from '@/types';

export const dynamic = 'force-dynamic';

// Inicializar Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    // Verificar si la API Key está configurada
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
        console.error('CRITICAL: GEMINI_API_KEY is not configured.');
        return NextResponse.json(
            { message: 'Error de configuración: La clave de Google Gemini no está configurada. Por favor, agregue GEMINI_API_KEY en las variables de entorno de Vercel.' },
            { status: 500 }
        );
    }

    try {
        const { messages, denunciaData }: { messages: Message[], denunciaData: DenunciaData } = await request.json();

        // Configurar el modelo - Usamos gemini-1.5-flash explícito
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
        });

        // Prompt del sistema como texto para evitar problemas de versión de API
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

        // Gemini REQUIERE que el primer mensaje del historial sea del usuario ('user')
        // Filtramos el mensaje de bienvenida inicial si es el primero
        const historyMessages = messages.slice(0, -1);
        let validHistory = historyMessages;

        if (historyMessages.length > 0 && historyMessages[0].role !== 'user') {
            validHistory = historyMessages.slice(1);
        }

        const history = validHistory.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));

        // Inyectamos el system prompt al inicio del historial de forma manual
        // para garantizar compatibilidad con modelos que no soportan systemInstruction
        if (history.length === 0) {
           // Si es el primer mensaje, no hacemos nada aquí, el prompt se pegará al mensaje actual
        }

        const currentMessage = messages[messages.length - 1].content;
        
        // Construimos el mensaje final combinando instrucciones y entrada del usuario
        // Esta es la forma más robusta de "fingir" un system prompt en modelos básicos
        const combinedMessage = `
            ${systemPrompt}
            
            --------------------------------------------------
            HISTORIAL DE CHAT PREVIO (Contexto):
            ${history.map(m => `${m.role.toUpperCase()}: ${m.parts[0].text}`).join('\n')}
            --------------------------------------------------
            
            MENSAJE ACTUAL DEL CIUDADANO:
            ${currentMessage}
            
            TU RESPUESTA:
        `;

        // Usamos generateContent en lugar de startChat para control total del contexto
        // Esto evita errores de "role order" en el historial nativo
        const result = await model.generateContent(combinedMessage);
        const response = await result.response;
        const aiResponse = response.text();

        // Lógica de extracción (Heurística simple)
        const updatedData = { ...denunciaData };
        const lastUserMessage = currentMessage;

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
        console.error('Gemini Error:', error);
        
        // Extract specific error details
        const errorMessage = error.message || 'Error desconocido';
        const errorType = error.constructor.name || 'Error';
        
        return NextResponse.json(
            { 
                message: `Hubo un error al procesar su mensaje con Google Gemini. Detalle técnico: ${errorType} - ${errorMessage}`,
                error: errorMessage
            },
            { status: 500 }
        );
    }
}

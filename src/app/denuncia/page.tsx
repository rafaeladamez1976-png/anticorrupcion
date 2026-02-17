'use client';
import { useState, useRef, useEffect } from 'react';
import { Message, DenunciaData } from '@/types';
import { Send, Shield, Info, Loader2 } from 'lucide-react';

export default function DenunciaPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Bienvenido al Sistema de Análisis de Denuncias de Sinaloa.\n\nEste sistema le guiará paso a paso para estructurar su denuncia de manera efectiva. **No se solicitarán datos personales.** Su anonimato es nuestra prioridad.\n\nPara comenzar, por favor indique: ¿En qué **municipio de Sinaloa** ocurrieron los hechos?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [denunciaData, setDenunciaData] = useState<DenunciaData>({
        municipio: '',
        tipo: '',
        institucion: '',
        descripcion: '',
        fechaHechos: ''
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/ia/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    denunciaData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: `⚠️ **Error:** ${data.message || 'Error en la comunicación con la IA'}` 
                }]);
                return;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

            if (data.denunciaData) {
                setDenunciaData(data.denunciaData);
            }

            if (data.completed) {
                await guardarDenuncia(data.denunciaCompleta);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Lo siento, ha ocurrido un error técnico. Por favor, intente de nuevo o recargue la página.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const guardarDenuncia = async (denunciaCompleta: any) => {
        setLoading(true);
        try {
            const response = await fetch('/api/denuncias/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(denunciaCompleta)
            });

            if (!response.ok) throw new Error('Error al guardar la denuncia');

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `### ✅ Denuncia registrada exitosamente.\n\nSu reporte ha sido procesado mediante nuestro sistema de scoring inteligente.\n\n**CÓDIGO ÚNICO DE SEGUIMIENTO:**\n# ${data.codigo}\n\n⚠️ **IMPORTANTE:** Guarde este código en un lugar seguro. Por seguridad, es la única forma de consultar el estado de su denuncia. Al cerrar esta ventana, no podrá recuperar el código.`
            }]);
        } catch (error) {
            console.error('Save error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Hubo un error al guardar su denuncia en el sistema oficial. Por favor, intente de nuevo.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-4 md:p-6 flex flex-col items-center">
            <div className="w-full max-w-4xl flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 flex items-center justify-between border border-white/20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-6 h-6 text-blue-600" />
                            <h1 className="text-2xl font-black text-gray-900">Reportar Denuncia</h1>
                        </div>
                        <p className="text-gray-700 font-bold text-sm">Sistema guiado por IA - Proceso 100% anónimo</p>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-white/50 backdrop-blur-md rounded-[2rem] shadow-2xl p-4 md:p-8 flex flex-col border border-white/30 overflow-hidden mb-6">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] rounded-3xl p-4 md:p-6 shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                }`}>
                                    <div className="prose prose-sm md:prose-base max-w-none prose-p:leading-relaxed whitespace-pre-wrap font-bold">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/80 rounded-3xl p-4 flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    <span className="text-sm font-black text-gray-600">Analizando con IA...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="mt-6 flex gap-3 bg-white p-2 rounded-2xl shadow-inner border border-gray-100">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe tu mensaje aquí..."
                            className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-gray-800 font-bold placeholder:text-gray-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-blue-500/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-blue-200/50">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs md:text-sm text-blue-900 font-bold leading-tight">
                        Este chat es procesado por un modelo de IA avanzado. No proporcione información personal. 
                        Toda la información se maneja siguiendo protocolos de anonimato total.
                    </p>
                </div>
            </div>
        </div>
    );
}

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

            if (!response.ok) throw new Error('Error en la comunicación con la IA');

            const data = await response.json();

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
        // MOCK SAVE
        setLoading(true);
        setTimeout(() => {
            const mockCodigo = 'SINALOA-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `### ✅ Denuncia registrada exitosamente (MODO DEMO).\n\nSu reporte ha sido procesado mediante nuestro sistema de scoring inteligente.\n\n**CÓDIGO ÚNICO DE SEGUIMIENTO:**\n# ${mockCodigo}\n\n⚠️ **IMPORTANTE:** Guarde este código en un lugar seguro. Por seguridad, es la única forma de consultar el estado de su denuncia. Al cerrar esta ventana, no podrá recuperar el código.`
            }]);
            setLoading(false);
        }, 1500);
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
                    <div className="hidden md:flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Estado</span>
                            <span className="text-sm font-bold text-gray-900">Encriptación Activa</span>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                            <Info className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div
                    ref={scrollRef}
                    className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-6 flex-1 overflow-y-auto min-h-[400px] border border-white/20 scroll-smooth"
                >
                    <div className="space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`inline-block max-w-[85%] md:max-w-[75%] p-5 rounded-3xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-900 border-2 border-blue-50 rounded-tl-none font-medium'
                                    }`}>
                                    <div className="prose prose-sm prose-blue font-bold whitespace-pre-wrap leading-relaxed">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border-2 border-blue-50 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    <p className="text-blue-600 font-black text-sm uppercase tracking-widest">Analizando su respuesta...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input */}
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-3 flex gap-3 border border-white/20">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escriba su respuesta aquí..."
                        className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none transition-all placeholder:text-gray-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <span className="hidden md:inline mr-2">Enviar</span>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <p className="text-center text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mt-4">
                    Cifrado de extremo a extremo • No se almacenan cookies • Sinaloa Anticorrupción
                </p>
            </div>
        </div>
    );
}

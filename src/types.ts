export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface DenunciaData {
    municipio: string;
    tipo: string;
    institucion?: string;
    descripcion: string;
    fechaHechos?: string;
}

export interface DenunciaCompleta extends DenunciaData {
    id?: string;
    codigo_unico?: string;
    score_verosimilitud?: number;
    nivel_verosimilitud?: string;
    estado?: string;
    created_at?: string;
}

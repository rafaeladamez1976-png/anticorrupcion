export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface DenunciaData {
    municipio?: string;
    tipo?: string;
    institucion?: string;
    descripcion?: string;
    fechaHechos?: string;
}

export interface DenunciaCompleta extends DenunciaData {
    codigo_unico: string;
    score_verosimilitud: number;
    nivel_verosimilitud: string;
    estado: string;
    analisis_ia: string;
    senales_positivas: string[];
    senales_negativas: string[];
}

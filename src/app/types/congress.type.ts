export interface Congress {
    idCongreso: number;
    idInformeActividad: number;
    numero: number;
    titulo: string;
    autores: string;
    congreso: string;
    //indice: string;
    doi: string;
    ifSjr: string;

    //ifJcrSjr: string;
    cuartil: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

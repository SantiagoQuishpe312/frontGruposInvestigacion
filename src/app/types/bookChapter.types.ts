export interface BookChapter {
    idLibroCapitulo: number;
    idInformeActividades: number;
    numero: number;
    titulo: string;
    autor: string;
    libro: string;
    indice: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

export interface Unsatisfactory {
    id: number;
    idCierre: number; // Relación con el modelo 'ModelClosure'
    registro: string;
    criteriosNoSatisfactorio: string;
    accionesNoSatisfactorio: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

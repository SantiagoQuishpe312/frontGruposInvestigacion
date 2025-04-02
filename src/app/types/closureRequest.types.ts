export interface ClosureRequest {
    id: number;
    motivacion: string;
    justificacion: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
    idCierre: number; // Relación con el modelo 'ModelClosure'
}

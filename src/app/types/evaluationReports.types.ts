
export interface EvaluationsReport {
    id: number;
    cumplimientoEstrategico: number;
    cumplimientoOperativo: number;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
    idGrupoInvestigacion: number;

    // idsEvidencias?: number[]; // Descomentar si necesitas incluir la lista de evidencias
}

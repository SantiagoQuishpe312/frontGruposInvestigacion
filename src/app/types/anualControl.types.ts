export interface AnualControl {
    idPanelControl: number;
    idPlanAnual: number;
    idOds:number;
    idEstrategia: number;
    objetivoAnual: string;
    producto: string;
    financiamiento: string;
    monto: number;
    presupuesto: string;
    periodicidad: string;
    fechaInicio: Date;
    fechaFin: Date;
    mediosVerificacion: string;
    montoCertificado?: number;
    montoComprometido?: number;
    valorDevengado?: number;
    certificado?: string;
    fechaSeguimiento?: Date;
    montoDisponible?: number;
    cumplimiento?: number;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;   
    fechaModificacion: Date;
}

import { AnnualControlComplete } from "./anualControl.types";

export interface AnnualOperativePlan{
    idAnnualOperativePlan: number;
    idGrupoInvestigacion: number;
    objetivoGeneral: string;
    usuarioCreado: string;
    fechaCreacion: Date;
    usuarioModificado: string;
    fechaModificacion: Date;
}

export interface DocAnnualOperativePlan{
    planOpAnual: AnnualOperativePlan;
    controlAnual:AnnualControlComplete[];
}
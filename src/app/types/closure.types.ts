import { ClosureRequest } from "./closureRequest.types";
import { Unsatisfactory } from "./unsatisfactory.types";

export interface Closure {
    id: number;
    objCierre: string;
    contexto: string;
    objInicial: string;
    actividades: string;
    impactoAcad: string;
    impactoFin: string;
    reubicacion: string;
    conclusion: string;
    recomendacion: string;
    proceso: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
    idGrupoInvestigacion: number;
}

export interface ClosureComplete {
    informeCierre: Closure;
    solicitudCierreGI:ClosureRequest;
    evInsatisfactoria:Unsatisfactory;
}
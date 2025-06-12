import { ODS } from "./ods.types";
import { Strategies } from "./strategies.types";
import { SpecificObjetives } from "./specificObjetives.types";
export interface Objectives_Strategies_Ods {
    idEstrategia: number;
    idObjetivoEspecifico: number;
    idODS:number;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

export interface ObjectiveCompleteOds{
    obj:SpecificObjetives ;
    ods:ODS[];
    strategies:Strategies[];
}
export interface EstrategiaOds{
    estrategia:Strategies;
    ods:ODS;
}

export interface ObjectiveCompleteOdsById{  
    obj:SpecificObjetives ;
    estrategiasOds: EstrategiaOds[];
}
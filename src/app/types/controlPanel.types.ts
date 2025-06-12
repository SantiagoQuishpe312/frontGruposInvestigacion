import { SpecificObjetives } from "./specificObjetives.types";
import { Usuario } from "./usuario.types";

export interface ControlPanelForm {
    idPanelControl: number;
    idPlanDesarrollo: number;
    idObjetivoEspecifico: number;
    idResponsable: number;
    actividad: string;
    indicadorNombre: string;
    indicadorTipo: string;
    indicadorForma: string;
    indicadorCondicional: string;
    indicadorAcumulativo: string;
    meta1: number;
    meta2: number;
    meta3: number;
    meta4: number;
    financiamiento: number;
    observacion: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

export interface ControlPanelComplete{
    panelControl:ControlPanelForm;
    responsable:Usuario;
    objetivoEspecifico:SpecificObjetives;
}
import { AcademicDomain } from "./academicDomain.types";
import { Area } from "./area.types";
import { Usuario } from "./usuario.types";
import { Line } from "./line.types";
export interface InvGroupForm {
    idGrupoInv: number;
    idCoordinador: number;
    nombreGrupoInv: string;
    estadoGrupoInv: string;
    acronimoGrupoinv: string;
    mision?:string;
    vision?:string;
    departamento?: string;
    proceso?:string;
    adicional?:string;
    sede?:string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;

}

export interface InvGroupCompleteForm{
    invGroup: InvGroupForm;
    area:Area[];
    users:Usuario[];
    academicDomain:AcademicDomain[];
    line:Line[];
    coordinador:Usuario;

}
import { InvGroupCompleteForm } from "./invGroup.types";
import { Usuario } from "./usuario.types";

export interface Link {
    idVinculacion: number;
    idGrupoInv: number;
    idUser: number;
    justificacion: string;
    estado: string;
    tipo:string;
    estatus: string;
    observaciones: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

export interface LinksComplete {
    formularioVinculacion: Link;
    grupoInvestigacion:InvGroupCompleteForm;
    nuevoInvestigador:Usuario;
}

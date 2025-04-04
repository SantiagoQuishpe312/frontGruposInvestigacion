import { Usuario } from "./usuario.types";

export interface InvMemberForm {
    idGrupoInv: number;
    idUsuario: number;
    fechaVinculacion: Date;
    tipo: string;
    status?: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
    user?:Usuario;

}

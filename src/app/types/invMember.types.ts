export interface InvMemberForm {
    idGrupoInv: number;
    idUsuario: number;
    estado: boolean;
    tipo: string;
    status?: string;

    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

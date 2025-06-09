export interface DeveLegaForm {
    idPlan: number;
    idMarco: number;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}
export interface LegalFrameworkFilter{
    marcoLegal:{ idMarcoLegal?:number;
     nombre?:string;
     estado?:boolean;
     usuarioCreacion?:string;
     fechaCreacion?:Date;
     usuarioModificacion?:string;
     fechaModificacion?:Date;};
 }    
export interface DeveUppe {
    idPlan: number;
    idPlanNivelSuperior: number;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

export interface UpperLevelPlanFilter{
    planDeNivelSuperior:{idPlanNivelSuperior?:number;
    nombre?:string;
    estado?:boolean;
    usuarioCreacion?:string;
    fechaCreacion?:Date;
    usuarioModificacion?:string;
    fechaModificacion?:Date;};
}
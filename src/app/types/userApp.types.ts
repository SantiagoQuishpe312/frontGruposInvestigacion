

export interface UserApp {
  id: string;
  cedula: string;
  nombres: string;
  correoInstitucional: string;
  correoPersonal: string;
  urlFoto: string;
  tipo: string;
  ubicacion: string;
  idBd?: number;
  //roles: UserRole[]; 
  escalafon:string;
  grado:string;
  nacionalidad:string;
  sexo:string;
}
export interface UserRole {
  idRol: number;
  nombreRol: string;
  fechaCreacionRol: string | null;
  usuarioCreacionRol: string | null;
  fechaModificacionRol: string | null;
  usuarioModificacionRol: string | null;
}
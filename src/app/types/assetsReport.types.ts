import { AssetesDetails } from "./assetesDetails.types";

export interface AssetsReport{
    idReporteActivos: number;
    idGrupoInvestigacion: number;
    objetivoReporte: String;
    contextoReporte: String;
    usoEstado?: String;
    condicionesGenerales: String;
    relevancia?: String;
    conclusiones?: String;
    usuarioCreado?: String;
    fechaCreacionReporte?: Date;
    usuarioModificadoReporte?: String;
    fechaModificacionReporte?: String;
}

export interface AssetsReportComplete{
    reporteBienes:AssetsReport;
    detalleBienes:AssetesDetails[];
}
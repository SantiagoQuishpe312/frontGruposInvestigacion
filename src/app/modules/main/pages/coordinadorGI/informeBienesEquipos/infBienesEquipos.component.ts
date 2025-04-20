import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/core/auth/services/auth.service";
import { AssetsReportService } from "src/app/core/http/assets-report/assets-report.service";
import { AssetsReport } from "src/app/types/assetsReport.types";
import { ActivatedRoute, Router } from "@angular/router";
import { DetalleEquiposComponent } from './modalBienesEquipos/modalDetalles.component';
import { MatDialog } from "@angular/material/dialog";
import { AssetesDetails } from "src/app/types/assetesDetails.types";
import { MatTableDataSource } from '@angular/material/table';
import { AssetsDetailsService } from "src/app/core/http/assetsDetails/assets-details.service";
import { AnnexesService } from "src/app/core/http/annexes/annexes.service";
import { DocumentsService } from "src/app/core/http/documentos/documents.service";
import { InvGroupService } from "src/app/core/http/inv-group/inv-group.service";
import { Annexes } from "src/app/types/annexes.types";
import { InvGroupForm } from "src/app/types/invGroup.types";

@Component({
    selector: 'vex-bienes-form',
    templateUrl: './infBienesEquipos.component.html',
    styleUrls: ['./creation-form.component.scss'],
})
export class infBienesEquiposComponent implements OnInit {
    idGrupoInvestigacion: number;
    isLinear = true;
    myForm: FormGroup;
    currentUser: string;
    currentDate: Date = new Date();
    detalles: AssetesDetails[] = [];
    displayedDetalleColumns: string[] = ['codigo', 'descripcion', 'fechaAdquisicion', 'estadoActual', 'ubicacionActual', 'acciones'];
    dataSource = new MatTableDataSource<any>(this.detalles);

    selectedFile: File | undefined;
    fileName: string = '';
    fileUploaded: boolean = false;
    groupId: number;
    token: string;
    loading: boolean = false;
    originalFileName: string;
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private assetsReportService: AssetsReportService,
        private datePipe: DatePipe,
        private dialog: MatDialog,
        private assetsDetailsService: AssetsDetailsService,
        private annexesService: AnnexesService,
        private documentService: DocumentsService,
        private invGroupService: InvGroupService,
    ) {
        this.myForm = this.fb.group({
            form1: this.fb.group({
                objetivoReporte: ['', Validators.required],
                contextoReporte: ['', Validators.required]
            }),
            form2: this.fb.group({
                usoEstado: ['', Validators.required],
                condicionesGenerales: ['', Validators.required],
                relevancia: ['', Validators.required],
            }),
            form3: this.fb.group({
                conclusiones: ['', Validators.required]
            })
        });
    }

    ngOnInit(): void {
        this.groupId = Number(sessionStorage.getItem("invGroup"));
        this.currentUser = this.authService.getUserName();
    }

    get form1() { return this.myForm.get('form1') as FormGroup; }
    get form2() { return this.myForm.get('form2') as FormGroup; }
    get form3() { return this.myForm.get('form3') as FormGroup; }

    abrirModalDetalle(detalle?: any): void {
        const dialogRef = this.dialog.open(DetalleEquiposComponent, {
            width: '600px',
            data: detalle || {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (detalle) {
                    const index = this.detalles.indexOf(detalle);
                    if (index > -1) this.detalles[index] = result;
                } else {
                    this.detalles.push(result);
                }
                this.dataSource.data = this.detalles; // <-- ¡esto actualiza la tabla!

            }
        });
    }

    eliminarDetalle(detalle: any): void {
        const index = this.detalles.indexOf(detalle);
        if (index > -1) this.detalles.splice(index, 1);
        this.dataSource.data = this.detalles; // <-- ¡esto actualiza la tabla!

    }

    guardarInforme() {
        const assetsReport: AssetsReport = {
            idReporteActivos: 0,
            idGrupoInvestigacion: this.groupId,
            objetivoReporte: this.myForm.value.form1.objetivoReporte,
            contextoReporte: this.myForm.value.form1.contextoReporte,
            usoEstado: this.myForm.value.form2.usoEstado,
            condicionesGenerales: this.myForm.value.form2.condicionesGenerales,
            relevancia: this.myForm.value.form2.relevancia,
            conclusiones: this.myForm.value.form3.conclusiones
        }

        this.assetsReportService.createAssetsReport(assetsReport).subscribe(
            (response) => {
                this.saveDetails(response);
                this.saveAnexos();
            },
            (error) => {

            }
        );
    }

    saveDetails(idReporte: number) {
        this.detalles.forEach(detalle => {
            detalle.idReporte = idReporte;
            detalle.usuarioCreacion = this.currentUser;
            detalle.fechaCreacionDetalle = this.currentDate;
            this.assetsDetailsService.createAssetesDetails(detalle).subscribe(
                (response) => {
                },
                (error) => {
                }
            );
        })
        this.snackBar.open('Solicitudes enviadas correctamente', 'Cerrar', {
            duration: 3000,
        });
    }

    HandleSubmit() {
        this.loading = true;
        if (this.myForm.valid) {
            this.guardarInforme();

        } else {
            this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', {
                duration: 3000,
            });
        }
    }


    onDrop(event: any) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'pdf') {
                alert('Solo se permiten archivos PDF.');
                this.clearFileInput();
                return;
            }
            this.selectedFile = file;
            this.setFileName();
        }
    }

    setFileName() {
        if (!this.selectedFile) {
            return;
        }
        this.originalFileName = this.selectedFile.name;
        const name = `anexo_bienes_equipos_GI_${this.groupId}_${this.currentDate.getFullYear()}-${this.currentDate.getMonth() + 1}-${this.currentDate.getDate()}.pdf`;
        const modifiedFile = new File([this.selectedFile], name, { type: this.selectedFile.type });
        this.selectedFile = modifiedFile;
    }

    onDragOver(event: any) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.add('drag-over');
    }

    onDragLeave(event: any) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.remove('drag-over');
    }


    validateFileType() {
        if (this.selectedFile) {
            const fileExtension = this.selectedFile.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'pdf') {
                alert('Solo se permiten archivos PDF.');
                this.clearFileInput();
                this.selectedFile = undefined;
            } else {
                this.setFileName();
            }
        }
    }
    clearFileInput() {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }
    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
        this.validateFileType();

    }


    saveAnexos() {
        if (this.selectedFile) {
            const fileToUpload = this.selectedFile;
            const sistema = 'GruposInv';
            console.log(sistema, fileToUpload)
            this.documentService.saveDocument(this.token, fileToUpload, sistema).subscribe({
                next: (response) => {
                    const annexes: Annexes = {
                        idAnexo: null,
                        idDocumento: 1,
                        idGrupo: this.groupId,
                        nombreAnexo: response.fileName,
                        rutaAnexo: response.uuid,
                        usuarioCreacionAnexo: this.currentUser,
                        fechaCreacionAnexo: this.currentDate,
                        usuarioModificacionAnexo: '',
                        fechaModificacionAnexo: null
                    };

                    this.annexesService.createAnnexesForm(annexes).subscribe({
                        next: () => {
                            this.actualizarEstados();
                            this.loading = false;

                        },
                        error: (err) => {
                            console.error('Error al guardar anexos:', err);
                            this.loading = false;
                            this.snackBar.open('Error al enviar las solicitudes.', 'Cerrar', {
                                duration: 3000,
                            });
                        }
                    });
                },
                error: (err) => {
                    console.error('Error al guardar documento:', err);
                    this.loading = false;
                    this.snackBar.open('Error al guardar el documento.', 'Cerrar', {
                        duration: 3000,
                    });
                }
            });
        }
    }
    getFileIcon(fileType: string | undefined): string {
        if (!fileType) return ''; // Manejar el caso en que el tipo de archivo no esté definido

        // Convertir el tipo de archivo a minúsculas para manejar casos insensibles a mayúsculas y minúsculas
        const lowerCaseFileType = fileType.toLowerCase();

        // Mapear extensiones de archivo comunes a sus respectivos iconos
        const fileIcons: { [key: string]: string } = {
            'pdf': 'far fa-file-pdf', // Ejemplo de clase de estilo para un archivo PDF usando FontAwesome
            'doc': 'far fa-file-word', // Ejemplo de clase de estilo para un archivo de Word
            'docx': 'far fa-file-word', // Ejemplo de clase de estilo para un archivo de Word
            'txt': 'far fa-file-alt', // Ejemplo de clase de estilo para un archivo de texto
            'default': 'far fa-file' // Icono predeterminado para otros tipos de archivo
        };

        // Obtener el icono del archivo según su extensión
        const iconClass = fileIcons[lowerCaseFileType] || fileIcons['default'];

        return iconClass; // Retornar la clase de estilo del icono
    }
    actualizarEstados() {
        this.invGroupService.getById(this.groupId).subscribe(data => {
            const invGroup: InvGroupForm = {
                idGrupoInv: this.groupId,
                idCoordinador: data.idCoordinador,
                nombreGrupoInv: data.nombreGrupoInv,
                estadoGrupoInv: data.estadoGrupoInv,
                acronimoGrupoinv: data.acronimoGrupoinv,
                usuarioCreacion: data.usuarioCreacion,
                fechaCreacion: data.fechaCreacion,
                usuarioModificacion: this.currentUser,
                fechaModificacion: this.currentDate,
                proceso: '35',

            }
            this.invGroupService.update(this.groupId, invGroup).subscribe(
                (response) => {
                    this.router.navigateByUrl('main/dashboard');
                });
        })
    }
}

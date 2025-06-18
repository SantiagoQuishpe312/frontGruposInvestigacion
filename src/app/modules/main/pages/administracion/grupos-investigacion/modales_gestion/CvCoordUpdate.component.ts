import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importa DomSanitizer y SafeResourceUrl
import { Annexes } from 'src/app/types/annexes.types';
import { error } from 'console';

@Component({
    selector: 'app-members',
    templateUrl: './CvCoordUpdate.component.html',
    styleUrls: ['../../../../styles/modales.scss']
})
export class CvCoordUpdate implements OnInit {
    isLoading: boolean = true;
    groupId: number;
    currentUser: string;
    currentDate: Date;
    rolExterno: string;
    view: number = 0;
    selectedFile: File | undefined;
    fileName: string = '';
    fileUploaded: boolean = false;
    token: string;
    pdfUrl: SafeResourceUrl | undefined;
    selectedUser: InvMemberForm;
    userId: number;
    constructor(
        private authService: AuthService,
        public dialogRef: MatDialogRef<CvCoordUpdate>,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private documentService: DocumentsService,
        private sanitizer: DomSanitizer,
        private annexesService: AnnexesService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.groupId = Number(sessionStorage.getItem('invGroup'));
        this.userId = Number(sessionStorage.getItem('userId'));
        this.currentUser = this.authService.getUserName(); this.currentDate = new Date();
        this.cargarHojasDeVida();
    }

    toggleForm(index: number): void {
        this.view = index;
    }

    cargarHojasDeVida(): void {
        this.token = sessionStorage.getItem('access_token');
        this.isLoading = true;
        this.annexesService.getByGroupType(this.groupId, `_Hoja_de_Vida_Coordinador${this.userId}`).subscribe((data) => {
            this.dataAnexo = data[0];
            console.log(data);
            this.documentService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo)
                .subscribe({
                    next: (blob) => {
                        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(pdfBlob);
                        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Marcar la URL como segura
                        this.isLoading = false;

                    },
                    error: (err) => {
                        this.isLoading = false;

                        console.error('Error al cargar el documento:', err);

                    }
                });

        })
        if (!this.dataAnexo){
            this.snackBar.open('No se encontró la hoja de vida.', 'Cerrar', {
                duration: 3000,
            });
            this.isLoading = false;
        }
    }
    originalFileName: string;
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
            console.error("Error: No hay archivo seleccionado.");
            return;
        }
        this.originalFileName = this.selectedFile.name;
        const name = `Hoja_de_Vida_Coordinador${this.userId}_${this.currentDate.getFullYear()}-${this.currentDate.getMonth() + 1}-${this.currentDate.getDate()}.pdf`;
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


    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
        this.validateFileType();
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

    dataAnexo: Annexes;
    onSubmit() {
        this.isLoading = true;
        if (this.selectedFile) {
            const fileToUpload = this.selectedFile;
            const sistema = 'GruposInv';

            this.documentService.saveDocument(this.token, fileToUpload, sistema).subscribe({
                next: (response) => {
                    const annexes: Annexes = {
                        idAnexo: this.dataAnexo.idAnexo,
                        idDocumento: this.dataAnexo.idDocumento,
                        idGrupo: this.dataAnexo.idGrupo,
                        nombreAnexo: response.fileName,
                        rutaAnexo: response.uuid,
                        usuarioCreacionAnexo: this.dataAnexo.usuarioCreacionAnexo,
                        fechaCreacionAnexo: this.dataAnexo.fechaCreacionAnexo,
                        usuarioModificacionAnexo: this.currentUser,
                        fechaModificacionAnexo: this.currentDate
                    };

                    this.annexesService.update(annexes.idAnexo, annexes).subscribe({
                        next: () => {
                            this.snackBar.open('Memorando enviado correctamente.', 'Cerrar', {
                                duration: 3000,
                            });
                            this.isLoading = false;
                            this.view = 0;

                        },
                        error: (err) => {
                            console.error('Error al guardar anexos:', err);
                            this.isLoading = false;
                            this.snackBar.open('Error al enviar el memorando.', 'Cerrar', {
                                duration: 3000,
                            });
                        }
                    });
                },
                error: (err) => {
                    console.error('Error al guardar documento:', err);
                    this.isLoading = false;
                    this.snackBar.open('Error al guardar el documento.', 'Cerrar', {
                        duration: 3000,
                    });
                }
            });
        }


    }

    getFileIcon(fileType: string | undefined): string {
        if (!fileType) return 'far fa-file'; // Ícono genérico si no hay tipo de archivo
        const fileIcons: { [key: string]: string } = {
            'application/pdf': 'far fa-file-pdf', // Ícono para PDF
            'image/png': 'far fa-file-image',
            'image/jpeg': 'far fa-file-image',
            'image/jpg': 'far fa-file-image',
            'image/gif': 'far fa-file-image',
            'image/bmp': 'far fa-file-image',
            'image/webp': 'far fa-file-image',
            'image/tiff': 'far fa-file-image',
            'image/svg+xml': 'far fa-file-image',
        };
        return fileIcons[fileType] || 'far fa-file';
    }

}

import { Component,OnInit } from '@angular/core';
import { Annexes } from 'src/app/types/annexes.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component'; // Asegúrate de crear este componente

@Component({
  selector: 'vex-memorando-nueve',
  templateUrl: './memorando-nueve.component.html',
  styleUrls: ['./memorando-nueve.component.scss']
})
export class MemorandoNueveComponent implements OnInit {
  selectedFile: File | undefined;
  fileName: string = '';
  fileUploaded: boolean = false; 
  currentDate: Date = new Date();
    currentUser: string;
    groupId: number;
    token: string;
    loading: boolean = false;
    originalFileName: string;
    constructor(
      private annexesService:AnnexesService,
      private router:Router,
      private authService: AuthService,
      private documentService: DocumentsService,
      private matSnackBar:MatSnackBar,
      private invGroupService: InvGroupService,
      private dialog: MatDialog // Agregado para mostrar la confirmación
  
    ) {}
    ngOnInit(): void {
      this.currentUser = this.authService.getUserName();
      this.groupId = Number(localStorage.getItem('GI'));
      this.token = sessionStorage.getItem('access_token');
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
        console.error("Error: No hay archivo seleccionado.");
        return;
      }
      this.originalFileName = this.selectedFile.name;
      const name = `acta_comite_inv_${this.groupId}_${this.currentDate.getFullYear()}-${this.currentDate.getMonth() + 1}-${this.currentDate.getDate()}.pdf`;
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
  
  
    onSubmit() {
      this.loading = true;
      if (this.selectedFile) {
        const fileToUpload = this.selectedFile;
        const sistema = 'GruposInv';
  
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
                this.loading = false;
  
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                  width: '400px',
                  data: {
                    title: 'Confirmación',
                    message: `La resolución para el Grupo "${this.groupId}" fue favorable?`,
                    confirmText: 'Sí',
                    cancelText: 'No'
                  }
                });
    
                dialogRef.afterClosed().subscribe(result => {
                  if (result) {
                    // Si el usuario responde "Sí"
                    this.actualizarEstados('favorable');
                    this.matSnackBar.open('Resolución enviada correctamente.', 'Cerrar', { duration: 3000 });
                  } else {
                    // Si el usuario responde "No"
                    this.actualizarEstados('Nofavorable');
  
                    this.matSnackBar.open('Se ha registrado la resolución, pero no fue favorable.', 'Cerrar', { duration: 3000 });
                  }
                });
              },
              error: (err) => {
                console.error('Error al guardar anexos:', err);
                this.loading = false;
                this.matSnackBar.open('Error al enviar resolución.', 'Cerrar', {
                  duration: 3000,
                });
              }
            });
          },
          error: (err) => {
            console.error('Error al guardar documento:', err);
            this.loading = false;
            this.matSnackBar.open('Error al guardar la resolución.', 'Cerrar', {
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
    
    actualizarEstados(resolucion:string){
     if(resolucion==='favorable'){
      this.invGroupService.getById(this.groupId).subscribe(data=>{
        const invGroup:InvGroupForm={
          idGrupoInv:this.groupId,
          idCoordinador:data.idCoordinador,
          nombreGrupoInv:data.nombreGrupoInv,
          estadoGrupoInv:resolucion,
          acronimoGrupoinv:data.acronimoGrupoinv,
          proceso:'9',
          usuarioCreacion:data.usuarioCreacion,
          fechaCreacion:data.fechaCreacion,
          usuarioModificacion:this.currentUser,
          fechaModificacion:this.currentDate
  
        }
        this.invGroupService.update(this.groupId,invGroup).subscribe(
          (response)=>{
            this.router.navigate(["main/solicitudes-comite"]);        });
      })
     }
     else if(resolucion==='Nofavorable'){
      this.invGroupService.getById(this.groupId).subscribe(data=>{
        const invGroup:InvGroupForm={
          idGrupoInv:this.groupId,
          idCoordinador:data.idCoordinador,
          nombreGrupoInv:data.nombreGrupoInv,
          estadoGrupoInv:resolucion,
          acronimoGrupoinv:data.acronimoGrupoinv,
          proceso:'N',
          usuarioCreacion:data.usuarioCreacion,
          fechaCreacion:data.fechaCreacion,
          usuarioModificacion:this.currentUser,
          fechaModificacion:this.currentDate
  
        }
        this.invGroupService.update(this.groupId,invGroup).subscribe(
          (response)=>{
            localStorage.removeItem('GI');
            this.router.navigate(["main/solicitudes-comite"]);        });
      })
     }
      
    }
    
    goBack() {
      this.router.navigate(["main/presentar-grupo-comite"]);
  
    }
}

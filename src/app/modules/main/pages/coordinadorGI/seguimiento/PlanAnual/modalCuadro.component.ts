
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { error } from "console";
import { AuthService } from "src/app/core/auth/services/auth.service";
import { SpecificObjetives } from "src/app/types/specificObjetives.types";
import { ObjStrategiesODSService } from "src/app/core/http/obj_strategies_ods/obj_strategies_ods.service";
import { Strategies } from "src/app/types/strategies.types";
import { ODS } from "src/app/types/ods.types";
import { forkJoin } from 'rxjs';
import { ControlPanelComplete, ControlPanelForm } from "src/app/types/controlPanel.types";
import { UsuarioService } from "src/app/core/http/usuario/usuario.service";
import { DevelopPlanFormComponent } from "src/@vex/components/forms/developmentPlanForm/developmentPlanForm.component";
import { DevelopmentPlanComplete } from "src/app/types/developPlanForm";

@Component({
    selector: 'app-modalCuadroOp',
    templateUrl: './modalCuadro.component.html',
    styleUrls: ['../../../../styles/modales.scss']
})
export class ModalCuadroOp implements OnInit {
    currentUser: string;
    currentDate: Date = new Date();
    objetivo: SpecificObjetives;
    panelControl: ControlPanelComplete;
    isSaved: boolean = false;
    isLoading: boolean = false;
    isEditing: boolean = false;
    myForm: FormGroup;
    ods: ODS[] = [];
    estrategias: Strategies[] = [];
    encargadoNombre: string;
    planDesarrolloCompleto: DevelopmentPlanComplete;
    groupId: number;
    token: string;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ModalCuadroOp>,
        private objStrategiesODSService: ObjStrategiesODSService,
        private usuarioService: UsuarioService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        //this.objetivo = data.objetivoEspecifico;
        //this.panelControl = data.panelControl;
        this.planDesarrolloCompleto = data.planDesarrollo;
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        this.obtenerObjetivosEspecificos();
        this.groupId = Number(sessionStorage.getItem('invGroup'));
        this.token = sessionStorage.getItem('access_token');
        this.myForm = this.fb.group({
            idObjetivoEspecifico: [null, Validators.required],
            idPlanAnual: [null],
            idPanelControl: [null, Validators.required],
            idOds: [null, Validators.required],
            idEstrategia: [null, Validators.required],
            objetivoAnual: ['', Validators.required],
            producto: ['', Validators.required],
            financiamiento: ['', Validators.required],
            monto: [null, Validators.required],
            presupuesto: ['', Validators.required],
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            mediosVerificacion: [''],
            usuarioCreacion: [this.currentUser, Validators.required],
            fechaCreacion: [this.currentDate, Validators.required],
            archivo: [null, Validators.required],  // Agregar validación para el archivo
        });

    }
    objetivosEspecificos: any[] = [];

    obtenerObjetivosEspecificos(): void {
        this.objetivosEspecificos = this.planDesarrolloCompleto.panelControl.map(panel => ({
            panelControl: panel,
            objetivoEspecifico: panel.objetivoEspecífico
        }));
    }
    getData(id: number) {
        this.objStrategiesODSService.getCompleteByObj(id).subscribe(objData => {
            this.estrategias = objData.strategies;
            this.ods = objData.ods;
        });
        this.encargadoNombre = this.panelControl.responsable.nombre;

    }
    onSelectionChange(event: any) {
        // Aquí puedes ejecutar la acción que necesitas cuando cambie la selección
        const seleccionado = this.myForm.get('idObjetivoEspecifico')?.value;
        this.panelControl = seleccionado.panelControl;
        this.objetivo = seleccionado.objetivoEspecifico;
        this.getData(this.objetivo.idObjetivo);
        this.myForm.get('idPanelControl')?.setValue(this.myForm.get('idObjetivoEspecifico')?.value.panelControl.panelControl.idPanelControl);
        
    }


    saveAnualControl(): void {
        if (this.myForm.valid) {
            const formData = this.myForm.value;
            if (this.selectedFile) {
                formData.selectedFile = this.selectedFile;
            }
            this.dialogRef.close(formData); // Devuelve los valores del formulario al componente padre
        } else {
            console.log("Formulario no válido")
            console.log(this.myForm.value)
        }
    }

    onClickClose(): void {
        this.dialogRef.close();
    }
    selectedFile: File | undefined;
    fileName: string = '';
    fileUploaded: boolean = false;
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
            return;
        }
        this.originalFileName = this.selectedFile.name;
        const name = `verificacion_obj${this.objetivo.idObjetivo}_group_${this.groupId}_${this.currentDate.getFullYear()}-${this.currentDate.getMonth() + 1}-${this.currentDate.getDate()}.pdf`;
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
        this.myForm.get('archivo')?.setValue(this.selectedFile);  // Actualiza el valor del archivo en el formulario
        this.myForm.updateValueAndValidity();
        console.log(this.myForm.value);
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
}
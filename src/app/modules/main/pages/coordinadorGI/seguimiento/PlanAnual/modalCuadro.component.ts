
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
import { ControlPanelService } from "src/app/core/http/control-panel/control-panel.service";

@Component({
    selector: 'app-modalCuadroOp',
    templateUrl: './modalCuadro.component.html',
    styleUrls: ['./modalCuadroStyle.scss']
})
export class ModalCuadroOp implements OnInit {
    currentUser: string;
    currentDate: Date = new Date();
    currentYear: number = new Date().getFullYear();
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
    showVerificationFields: boolean = false;
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ModalCuadroOp>,
        private objStrategiesODSService: ObjStrategiesODSService,
        private usuarioService: UsuarioService,
        private controlPanelService: ControlPanelService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.planDesarrolloCompleto = data.planDesarrollo;
    }
    colorSemaforo: string = '';
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
            objetivoAnual: [null, Validators.required],
            producto: ['', [Validators.required, this.validateMetaReal.bind(this)]],
            actividad: ['', Validators.required],
            financiamiento: [''],
            monto: [''],
            presupuesto: [''],
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            mediosVerificacion: [''],
            cumplimiento: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
            montoCertificado: [{ value: null, disabled: true }],
            montoComprometido: [{ value: null, disabled: true }],
            valorDevengado: [{ value: null, disabled: true }],
            certificado: [{ value: '', disabled: true }],
            fechaSeguimiento: [{ value: null, disabled: true }],
            montoDisponible: [{ value: null, disabled: true }],
            usuarioCreacion: [this.currentUser, Validators.required],
            fechaCreacion: [this.currentDate, Validators.required],
            archivo: [null, Validators.required],

        });
        this.myForm.get('financiamiento').valueChanges.subscribe(value => {
            const controlsToToggle = [
                'montoCertificado',
                'montoComprometido',
                'valorDevengado',
                'certificado',
                'fechaSeguimiento',
                'montoDisponible'
            ];
            controlsToToggle.forEach(controlName => {
                const control = this.myForm.get(controlName);
                if (value) {
                    control.enable();
                } else {
                    control.setValue(null);
                    control.disable();
                }
            });
        });
        this.myForm.get('producto')?.valueChanges.subscribe(() => this.calcularCumplimiento());
        this.myForm.get('objetivoAnual')?.valueChanges.subscribe(() => this.calcularCumplimiento());
        // this.myForm.get('producto')?.valueChanges.subscribe(() => {
        //     this.calcularCumplimiento();
        //     this.myForm.get('producto')?.updateValueAndValidity({ emitEvent: false });
        // });
        
        // this.myForm.get('objetivoAnual')?.valueChanges.subscribe(() => {
        //     this.calcularCumplimiento();
        //     this.myForm.get('producto')?.updateValueAndValidity({ emitEvent: false });
        // });
    }
    objetivosEspecificos: any[] = [];
    obtenerObjetivosEspecificos(): void {
        this.objetivosEspecificos = this.planDesarrolloCompleto.panelControl.map(panel => ({
            panelControl: panel,
            objetivoEspecifico: panel.objetivoEspecífico
        }));
        console.log(this.objetivosEspecificos)
    }
    actividades: ControlPanelForm[] = [];
    getData(id: number) {
        this.isLoading = true;
        this.objStrategiesODSService.getCompleteByObj(id).subscribe({
            next: (objData) => {
                this.estrategias = objData.strategies;
                this.ods = objData.ods;
                if (this.estrategias.length === 1) {
                    this.myForm.get('idEstrategia').setValue(this.estrategias[0].idEstrategia);
                }

                if (this.ods.length === 1) {
                    this.myForm.get('idOds').setValue(this.ods[0].id);
                }

                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading strategies and ODS:', err);
                this.isLoading = false;
            }
        });

        this.controlPanelService.getBySpecificObjetive(id).subscribe({
            next: (control) => {
                this.actividades = control;
            },
            error: (err) => {
                console.error('Error loading activities:', err);
            }
        });
    }


    getTodasLasEstrategias(): string {
        return this.estrategias
            .map(e => '• ' + e.estrategia)
            .join('\n');
    }

    getTodosLosOds(): string {
        return this.ods
            .map(o => '• ' + o.ods)
            .join('\n');
    }
    seleccionado: any;

    onSelectionChange(event: any) {
        const seleccionado = this.myForm.get('idObjetivoEspecifico')?.value;
        this.panelControl = seleccionado.panelControl;
        this.objetivo = seleccionado.objetivoEspecifico;
        this.getData(this.objetivo.idObjetivo);
    }
    onSelectionChange2(event: any) {
        const seleccionado = this.myForm.get('actividad')?.value;
        this.myForm.get('idPanelControl')?.setValue(this.myForm.get('actividad')?.value.idPanelControl);
        this.getPanel(seleccionado);
        this.seleccionado = seleccionado;
    }

    panelFiltrado: ControlPanelForm;
    getPanel(id: number) {
        this.controlPanelService.getById(id).subscribe(panel => {
            this.panelFiltrado = panel;
            this.myForm.get('objetivoAnual')?.setValue(panel.meta1);
            this.getUser(panel.idResponsable);
        })
    }

// Actualiza el método calcularCumplimiento para que no calcule si el producto es mayor:

calcularCumplimiento() {
    if (!this.panelFiltrado) {
        return;
    }
    
    const planificado = Number(this.panelFiltrado.meta1); // Usar meta1 de la tabla
    const real = Number(this.myForm.get('producto')?.value);
    
    // Establecer el valor planificado en el campo objetivoAnual
    this.myForm.get('objetivoAnual')?.setValue(planificado, { emitEvent: false });
    
    if (planificado > 0 && real >= 0) {
        // Si el producto es mayor al planificado, no calcular cumplimiento
        if (real > planificado) {
            this.myForm.get('cumplimiento')?.setValue(null);
            this.colorSemaforo = '';
            console.warn('No se puede calcular cumplimiento: la meta real es mayor a la meta planificada');
            return;
        }
        
        const cumplimiento = (real / planificado) * 100;
        const cumplimientoRedondeado = Number(cumplimiento.toFixed(2));
        this.myForm.get('cumplimiento')?.setValue(cumplimientoRedondeado);
        
        // Semaforización
        if (cumplimientoRedondeado < 70) {
            this.colorSemaforo = 'rojo';
        } else if (cumplimientoRedondeado >= 70 && cumplimientoRedondeado <= 90) {
            this.colorSemaforo = 'amarillo';
        } else {
            this.colorSemaforo = 'verde';
        }
    } else {
        this.myForm.get('cumplimiento')?.setValue(0);
        this.colorSemaforo = '';
    }
}

// Actualiza también el validateMetaReal para que siga mostrando el error:
validateMetaReal(control: any) {
    if (!control.value || !this.myForm || !this.panelFiltrado) {
        return null;
    }
    
    const metaReal = Number(control.value);
    const metaPlanificada = Number(this.panelFiltrado.meta1); // Usar meta1 de la tabla
    
    if (metaPlanificada > 0 && metaReal > metaPlanificada) {
        return { metaRealExcedida: true };
    }
    
    return null;
}
    


    getUser(id: number) {
        this.usuarioService.getById(id).subscribe(user => {
            this.encargadoNombre = user.nombre;
        })
    }

    saveAnualControl(): void {
        this.myForm.get('actividad')?.setValue(this.seleccionado.actividad);
        if (this.myForm) {
            const formData = this.myForm.value;
            if (this.selectedFile) {
                formData.selectedFile = this.selectedFile;
            }
            this.dialogRef.close(formData); // Devuelve los valores del formulario al componente padre
        } else {
        }
    }

    onlyNumberInput(event: KeyboardEvent): void {
        const char = event.key;
        const allowedChars = '0123456789.,';
        if (!allowedChars.includes(char)) {
            event.preventDefault();
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
        const lowerCaseFileType = fileType.toLowerCase();
        const fileIcons: { [key: string]: string } = {
            'pdf': 'far fa-file-pdf', // Ejemplo de clase de estilo para un archivo PDF usando FontAwesome
            'doc': 'far fa-file-word', // Ejemplo de clase de estilo para un archivo de Word
            'docx': 'far fa-file-word', // Ejemplo de clase de estilo para un archivo de Word
            'txt': 'far fa-file-alt', // Ejemplo de clase de estilo para un archivo de texto
            'default': 'far fa-file' // Icono predeterminado para otros tipos de archivo
        };
        const iconClass = fileIcons[lowerCaseFileType] || fileIcons['default'];
        return iconClass; // Retornar la clase de estilo del icono
    }
}
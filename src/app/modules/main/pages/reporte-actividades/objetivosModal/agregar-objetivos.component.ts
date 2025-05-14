import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnualControl } from 'src/app/types/anualControl.types';
import { AnualControlService } from 'src/app/core/http/anual-control/anual-control.service';
import { AnnualOperativePlanService } from 'src/app/core/http/annual-operative-plan/annual-operative-plan.service';
import { AnnualOperativePlan, DocAnnualOperativePlan } from 'src/app/types/annualOperativePlan.types';
import { Strategies } from 'src/app/types/strategies.types';
import { ControlPanelComplete } from 'src/app/types/controlPanel.types';
import { SpecificObjetives } from 'src/app/types/specificObjetives.types';
import { ObjStrategiesODSService } from 'src/app/core/http/obj_strategies_ods/obj_strategies_ods.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
@Component({
  selector: 'app-agregar-objetivos',
  templateUrl: './agregar-objetivos.component.html',
  styleUrls: ['../estilosModales.component.scss']
})
export class AgregarObjetivosComponent {
  objStrategiesForm: FormGroup;
  panelAnual: DocAnnualOperativePlan;
  groupId: number;
  estrategias: Strategies[] = [];
  panelControl: ControlPanelComplete;
  obj: SpecificObjetives;
  pdfUrl: SafeResourceUrl | undefined;

  constructor(
    private dialogRef: MatDialogRef<AgregarObjetivosComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private anualService: AnnualOperativePlanService,
    private anualControlService: AnualControlService,
    private objStrategiesODSService: ObjStrategiesODSService,
    private documentService: DocumentsService,
    private sanitizer: DomSanitizer,
    private annexesService: AnnexesService,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.groupId = Number(sessionStorage.getItem('invGroup'));

    this.obtenerPanelAnual();
    this.objStrategiesForm = this.formBuilder.group({
      idInformeActividades: [this.data.idInformeActividades],
      objetivo: ['', Validators.required],
      estrategia: ['', Validators.required],
      verificable: ['', Validators.required],
      cumplimiento: ['', [Validators.required, this.validarPorcentaje]],

      usuarioCreacion: [''],
      fechaCreacion: [''],
      usuarioModificacion: [''],
      fechaModificacion: ['']
    });
    document.addEventListener('keydown', (event) => {
      const element = event.target as HTMLInputElement;
      if (element.tagName === 'INPUT' && element.selectionStart === 0 && event.key === ' ') {
        event.preventDefault();
      }
    });
    this.capitalizeFirstLetter();

  }
  objetivos: any[] = [];
  token: string;

  obtenerPanelAnual() {
    console.log(this.groupId);
    this.anualService.getAllByIdGroup(this.groupId).subscribe(data => {
      this.panelAnual = data;
      this.objetivos = data.controlAnual.map(panel => ({
        panelControl: panel.controlPanel,
        objetivoEspecifico: panel.controlPanel.objetivoEspecífico
      }));
      console.log(this.panelAnual);
    });

  }

  onSelectionChange(event: any) {
    //Aquí puedes ejecutar la acción que necesitas cuando cambie la selección
    const seleccionado = this.objStrategiesForm.get('objetivo')?.value;
    this.panelControl = seleccionado.panelControl;
    this.obj = seleccionado.objetivoEspecifico;
    this.getData(this.obj.idObjetivo);

    //this.getData(this.objetivo.idObjetivo);
    //this.myForm.get('idPanelControl')?.setValue(this.myForm.get('idObjetivoEspecifico')?.value.panelControl.panelControl.idPanelControl);
  }
  getData(id: number) {
    this.objStrategiesODSService.getCompleteByObj(id).subscribe(objData => {
      this.estrategias = objData.strategies;
      //this.ods = objData.ods;
      this.getAnexos();
      this.token = sessionStorage.getItem('access_token');
    });
  }

  getAnexos() {
    this.annexesService.getByGroupType(this.groupId, `verificacion_obj${this.obj.idObjetivo}`).subscribe((data) => {
      this.documentService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo)
        .subscribe({
          next: (blob) => {
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Marcar la URL como segura
          },
          error: (err) => {
            console.error('Error al cargar el documento:', err);
          }
        });
    })
  }

  capitalizeFirstLetter() {
    for (const controlName in this.objStrategiesForm.controls) {
      if (this.objStrategiesForm.controls.hasOwnProperty(controlName)) {
        const control = this.objStrategiesForm.controls[controlName];
        control.valueChanges.subscribe((value: string) => {
          if (value && typeof value === 'string' && value.length > 0) {
            control.setValue(value.charAt(0).toUpperCase() + value.slice(1), { emitEvent: false });
          }
        });
      }
    }
  }

  save() {
    if (this.objStrategiesForm.valid) {
      this.objStrategiesForm.get('objetivo')?.setValue(this.obj);

      this.dialogRef.close(this.objStrategiesForm.value);

      this.snackBar.open('Se ha guardado con éxito', 'Cerrar', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('Por favor, llene todos los campos requeridos', 'Cerrar', {
        duration: 2000,
      });
    }
  }

  validarPorcentaje(control) {
    const cumplimiento = control.value;
    if (cumplimiento < 0 || cumplimiento > 100) {
      return { 'rangoInvalido': true };
    }
    return null;
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

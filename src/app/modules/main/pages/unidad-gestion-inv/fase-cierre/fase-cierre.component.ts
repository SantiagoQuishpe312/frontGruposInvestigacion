import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { SolCreaGiService } from 'src/app/core/http/sol-crea-gi/sol-crea-gi.service';
import { SolicitudesModalComponent } from './solicitudes-modal/solicitudes-modal.component';
import { EvaluacionesModalComponent } from './evaluaciones-modal/evaluaciones-modal.component';
import { Closure } from 'src/app/types/closure.types';
import { ClosureService } from 'src/app/core/http/closure/closure.service';
import { ClosureRequestService } from 'src/app/core/http/closure-request/closure-request.service';
import { UnsatisfactoryService } from 'src/app/core/http/unsatisfactory/unsatisfactory.service';
import { EditarEvaluacionCierreComponent } from './evaluaciones-modal/editar-evaluacionCierre.component';
import { EditarSolicitudCierreComponent } from './solicitudes-modal/editar-solicitudCierre.component';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { Annexes } from 'src/app/types/annexes.types';
import { AnexosFaseCierreComponent } from './anexos-fase-cierre/anexos-fase-cierre.component';

@Component({
  selector: 'vex-fase-cierre',
  templateUrl: './fase-cierre.component.html',
  styleUrls: ['./fase-cierre.component.scss']
})
export class FaseCierreComponent implements OnInit {
  reporteForm: FormGroup;
  annexes: Annexes[] = [];
  pendingAnnexes: any[] = [];
  selectedAnnexType: string = '';
  solicitudForms: FormGroup[] = [];
  evaluacionForms: FormGroup[] = [];
  currentStep: number = 0;
  OneStepIndex: number = 1;
  SecondStepIndex: number = 2;
  ThreeStepIndex: number = 3;
  idInforme: number;
  idGrupoInvestigacion: number;
  invGroupExists: boolean = false;
  returnFromAnnex: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private closureService: ClosureService,
    private closureRequestService: ClosureRequestService,
    private unsatisfactoryService: UnsatisfactoryService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private solCreaGiService: SolCreaGiService,
    private annexeService: AnnexesService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUserName();
    const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    const userId = Number(sessionStorage.getItem('userId'));

    this.route.queryParams.subscribe(params => {
      if (params['refresh']) {
        this.returnFromAnnex = true;
        this.currentStep = 5;
      }
    });

    this.reporteForm = this.formBuilder.group({
      idGrupoInvestigacion: [''],
      objCierre: ['', Validators.required],
      contexto: ['', Validators.required],
      objInicial: ['', Validators.required],
      actividades: ['', Validators.required],
      impactoAcad: ['', Validators.required],
      impactoFin: ['', Validators.required],
      reubicacion: ['', Validators.required],
      conclusion: ['', Validators.required],
      recomendacion: ['', Validators.required],
      proceso: ['', Validators.required],
      usuarioCreacion: [currentUser],
      fechaCreacion: [currentDate],
      usuarioModificacion: [currentUser],
      fechaModificacion: [currentDate]
    });

    this.solCreaGiService.getAll().subscribe(groups => {
      const userGroup = groups.find(group => group.idCoordinador === userId);
      if (userGroup) {
        this.idGrupoInvestigacion = Number(localStorage.getItem('GI'));
        this.reporteForm.patchValue({
          idGrupoInvestigacion: this.idGrupoInvestigacion
        });
        this.loadAnnexes();
      }
    });

    this.subscribeToFieldChanges('objCierre');
    this.subscribeToFieldChanges('contexto')
    this.subscribeToFieldChanges('objInicial');
    this.subscribeToFieldChanges('actividades');
    this.subscribeToFieldChanges('impactoAcad');
    this.subscribeToFieldChanges('impactoFin');
    this.subscribeToFieldChanges('reubicacion');
    this.subscribeToFieldChanges('conclusion');
    this.subscribeToFieldChanges('recomendacion');
    this.subscribeToFieldChanges('proceso');
  }

  loadAnnexes() {
    if (this.idGrupoInvestigacion) {
      this.annexeService.getByGroupType(this.idGrupoInvestigacion, 'MEMORANDO').subscribe(memorandos => {
        this.annexeService.getByGroupType(this.idGrupoInvestigacion, 'SOLICITUD').subscribe(solicitudes => {
          this.annexeService.getByGroupType(this.idGrupoInvestigacion, 'INFORME').subscribe(informes => {
            this.annexes = [...memorandos, ...solicitudes, ...informes];
          });
        });
      });
    }
  }

  navigateToAnnex() {
    if (!this.selectedAnnexType) {
      this.snackBar.open('Debe seleccionar un tipo de anexo', 'Cerrar', { duration: 3000 });
      return;
    }

    const documentoId = this.getDocumentoId(this.selectedAnnexType);

    const dialogRef = this.dialog.open(AnexosFaseCierreComponent, {
      width: '800px',
      data: {
        grupoId: this.idGrupoInvestigacion,
        annexType: this.selectedAnnexType,
        idDocumento: documentoId,
        storeLocally: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pendingAnnexes = this.pendingAnnexes.filter(a => a.idDocumento !== documentoId);
        this.annexes = this.annexes.filter(a => a.idDocumento !== documentoId);

        this.pendingAnnexes.push(result);
        this.annexes.push(result);
      }
      this.selectedAnnexType = '';
    });
  }

  private getDocumentoId(tipo: string): number {
    switch (tipo) {
      case 'INFORME': return 1;
      case 'SOLICITUD': return 2;
      case 'MEMORANDO': return 3;
      default: return 1;
    }
  }

  replaceAnnex(index: number) {
    const annexToReplace = this.annexes[index];

    let docType = '';
    let idDocumento = 1;

    switch (annexToReplace.idDocumento) {
      case 1:
        docType = 'INFORME';
        idDocumento = 1;
        break;
      case 2:
        docType = 'SOLICITUD';
        idDocumento = 2;
        break;
      case 3:
        docType = 'MEMORANDO';
        idDocumento = 3;
        break;
    }

    this.selectedAnnexType = docType;

    const dialogRef = this.dialog.open(AnexosFaseCierreComponent, {
      width: '800px',
      data: {
        grupoId: this.idGrupoInvestigacion,
        annexType: docType,
        idDocumento: idDocumento,
        storeLocally: true,
        isReplacement: true,
        replacingId: annexToReplace.idAnexo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.isLocalOnly) {
          const pendingIndex = this.pendingAnnexes.findIndex(a =>
            a.nombreAnexo === annexToReplace.nombreAnexo);

          if (pendingIndex >= 0) {
            this.pendingAnnexes[pendingIndex] = result;
          } else {
            result.replacingId = annexToReplace.idAnexo;
            this.pendingAnnexes.push(result);
          }

          this.annexes[index] = result;

          this.snackBar.open('El anexo ha sido marcado para reemplazo y se actualizará al guardar el informe', 'Cerrar', {
            duration: 3000
          });
        } else {
          this.loadAnnexes();
        }
      }
      this.selectedAnnexType = '';
    });
  }


  private subscribeToFieldChanges(fieldName: string): void {
    this.reporteForm.get(fieldName).valueChanges.subscribe((value: string) => {
      if (value && value.trim().length === 0) {
        this.reporteForm.get(fieldName).setValue('', { emitEvent: false });
      } else if (value) {
        const newValue = value.charAt(0).toUpperCase() + value.slice(1);
        const formattedValue = newValue.replace(/^(.*?\S)(.*)$/, (_, firstWord, rest) => {
          return firstWord + rest.replace(/\s/g, ' ');
        });
        this.reporteForm.get(fieldName).setValue(formattedValue, { emitEvent: false });
      }
    });
  }

  openAgregarSolicitudesModal() {
    const dialogRef: MatDialogRef<SolicitudesModalComponent> = this.dialog.open(SolicitudesModalComponent, {
      width: '600px',
      data: { idCierre: this.idInforme }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const solicitudesForm = this.formBuilder.group({
          idCierre: [''],
          motivacion: [result.motivacion, Validators.required],
          justificacion: [result.justificacion, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.solicitudForms.push(solicitudesForm);
      }
    });
  }

  actualizarSolicitud(index: number) {
    const dialogRef = this.dialog.open(EditarSolicitudCierreComponent, {
      width: '600px',
      data: {
        motivacion: this.solicitudForms[index].get('motivacion').value,
        justificacion: this.solicitudForms[index].get('justificacion').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.solicitudForms[index].patchValue({
          motivacion: result.motivacion,
          justificacion: result.justificacion
        });
      }
    });
  }

  borrarSolicitud(index: number) {
    this.solicitudForms.splice(index, 1);
  }

  openAgregarEvaluacionesModal() {
    const dialogRef: MatDialogRef<EvaluacionesModalComponent> = this.dialog.open(EvaluacionesModalComponent, {
      width: '600px',
      data: { idCierre: this.idInforme }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const evaluacionForm = this.formBuilder.group({
          idCierre: [''],
          registro: [result.registro, Validators.required],
          criteriosNoSatisfactorio: [result.criteriosNoSatisfactorio, Validators.required],
          accionesNoSatisfactorio: [result.accionesNoSatisfactorio, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.evaluacionForms.push(evaluacionForm);
      }
    });
  }

  actualizarEvaluacion(index: number) {
    const dialogRef = this.dialog.open(EditarEvaluacionCierreComponent, {
      width: '600px',
      data: {
        registro: this.evaluacionForms[index].get('registro').value,
        criteriosNoSatisfactorio: this.evaluacionForms[index].get('criteriosNoSatisfactorio').value,
        accionesNoSatisfactorio: this.evaluacionForms[index].get('accionesNoSatisfactorio').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.evaluacionForms[index].patchValue({
          registro: result.registro,
          criteriosNoSatisfactorio: result.criteriosNoSatisfactorio,
          accionesNoSatisfactorio: result.accionesNoSatisfactorio
        });
      }
    });
  }

  borrarEvaluacion(index: number) {
    this.evaluacionForms.splice(index, 1);
  }

  isAnnexPending(annex: Annexes): boolean {
    return this.pendingAnnexes.some(a => a.rutaAnexo === annex.rutaAnexo);
  }

  eliminarAnexo(index: number) {
    const deletedAnnex = this.annexes[index];

    this.pendingAnnexes = this.pendingAnnexes.filter(a => a.rutaAnexo !== deletedAnnex.rutaAnexo);
    this.annexes = this.annexes.filter(a => a.rutaAnexo !== deletedAnnex.rutaAnexo);

    this.snackBar.open('Anexo eliminado correctamente', 'Cerrar', {
      duration: 3000
    });
  }

  onSubmit() {
    if (this.reporteForm.valid && this.solicitudForms.some(form => form.valid) && this.evaluacionForms.every(form => form.valid)) {
      this.closureService.createClosure(this.reporteForm.value).subscribe(
        (reporteResponse: Closure) => {
          this.idInforme = reporteResponse.id;
          this.reporteForm.patchValue({
            id: reporteResponse,
          });

          this.solicitudForms.forEach(solicitudesForm => {
            solicitudesForm.patchValue({
              idCierre: reporteResponse
            });
            this.closureRequestService.create(solicitudesForm.value).subscribe(
              () => { },
              (error) => { }
            );
          });

          this.evaluacionForms.forEach(evaluacionForm => {
            evaluacionForm.patchValue({
              idCierre: reporteResponse
            });
            this.unsatisfactoryService.create(evaluacionForm.value).subscribe(
              () => { },
              (error) => { }
            );
          });

          const annexPromises = this.pendingAnnexes.map(annex => {
            const fileToUpload = annex.file;
            const sistema = 'GruposInv';
            return new Promise((resolve, reject) => {
              
              this.annexeService.createAnnexesForm({
                idAnexo: null,
                idDocumento: annex.idDocumento,
                idGrupo: this.idGrupoInvestigacion,
                nombreAnexo: annex.nombreAnexo,
                rutaAnexo: annex.rutaAnexo,
                usuarioCreacionAnexo: annex.usuarioCreacionAnexo,
                fechaCreacionAnexo: annex.fechaCreacionAnexo,
                usuarioModificacionAnexo: annex.usuarioModificacionAnexo,
                fechaModificacionAnexo: annex.fechaModificacionAnexo
              }).subscribe({
                next: (response) => {
                  resolve(response);
                },
                error: (err) => {
                  reject(err);
                }
              });
            });
          });

          Promise.all(annexPromises).then(() => {
            this.snackBar.open('Los datos se han guardado correctamente', 'Cerrar', {
              duration: 3000
            });
            setTimeout(() => {
              this.router.navigateByUrl('main/principal');
            }, 3000);
          }).catch(error => {
            this.snackBar.open('Error al guardar los anexos', 'Cerrar', {
              duration: 3000
            });
          });
        },
        (error) => { }
      );
    } else {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 3000
      });
    }
  }

  updateReport() {
    if (this.reporteForm.valid) {
      this.closureService.update(this.idInforme, this.reporteForm.value).subscribe(
        (updatedReport: Closure) => {
          this.snackBar.open('Informe actualizado correctamente', 'Cerrar', {
            duration: 2000,
            verticalPosition: 'top'
          });
        },
        (error) => {
          console.error('Error al actualizar el informe:', error);
        }
      );
    } else {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 3000
      });
    }
  }

  nextStep() {
    if (this.currentStep === 0) {
      if (this.reporteForm.get('objCierre').invalid || this.reporteForm.get('contexto').invalid) {
        this.snackBar.open('Por favor, complete los campos de Objetivo de Cierre y Contexto', 'Cerrar', { duration: 3000 });
        return;
      }
    } else if (this.currentStep === 1) {
      if (this.reporteForm.get('objInicial').invalid || this.reporteForm.get('actividades').invalid) {
        this.snackBar.open('Por favor, complete los campos de Objetivo Inicial y Actividades Principales', 'Cerrar', { duration: 3000 });
        return;
      }
    } else if (this.currentStep === 2) {
      if (this.solicitudForms.length === 0) {
        this.snackBar.open('Por favor, agregue al menos una razón para el cierre del grupo', 'Cerrar', { duration: 3000 });
        return;
      }
    } else if (this.currentStep === 3) {
      if (this.evaluacionForms.length === 0) {
        this.snackBar.open('Por favor, agregue al menos una evaluación no satisfactoria', 'Cerrar', { duration: 3000 });
        return;
      }
    } else if (this.currentStep === 4) {
      if (this.reporteForm.get('impactoAcad').invalid || this.reporteForm.get('impactoFin').invalid || this.reporteForm.get('reubicacion').invalid) {
        this.snackBar.open('Por favor, complete los campos de Objetivo Inicial, Actividades Principales y Reubicación', 'Cerrar', { duration: 3000 });
        return;
      }
    } else if (this.currentStep === 5) {
      if (this.reporteForm.get('conclusion').invalid || this.reporteForm.get('recomendacion').invalid || this.reporteForm.get('proceso').invalid) {
        this.snackBar.open('Por favor, complete los campos de Conclusión, Recomendación Final y Pasos a Seguir', 'Cerrar', { duration: 3000 });
        return;
      }
      if (this.annexes.length === 0 && this.pendingAnnexes.length === 0) {
        this.snackBar.open('Por favor, agregue al menos un anexo', 'Cerrar', { duration: 3000 });
        return;
      }
    }
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  isStepValid(stepIndex: number): boolean {
    if (stepIndex === 0) {
      return this.reporteForm.get('objCierre').valid && this.reporteForm.get('contexto').valid;
    } else if (stepIndex === 1) {
      return this.reporteForm.get('objInicial').valid && this.reporteForm.get('actividades').valid;
    } else if (stepIndex === 2) {
      return this.solicitudForms.length > 0;
    } else if (stepIndex === 3) {
      return this.evaluacionForms.length > 0;
    } else if (stepIndex === 4) {
      return this.reporteForm.get('impactoAcad').valid && this.reporteForm.get('impactoFin').valid && this.reporteForm.get('reubicacion').valid;
    } else if (stepIndex === 5) {
      return this.reporteForm.get('conclusion').valid && this.reporteForm.get('recomendacion').valid && this.reporteForm.get('proceso').valid;
    }
    return true;
  }
}
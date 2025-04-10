import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { InvGroup_linesService } from 'src/app/core/http/InvGroup_line/invGroup_linesService.service';
import { AreaService } from 'src/app/core/http/area/area.service';
import { LineService } from 'src/app/core/http/line/line.service';
import { InvGroup_areaService } from 'src/app/core/http/invGroup_area/crea-area.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvGroupCompleteForm } from 'src/app/types/invGroup.types';
import { InvGroup_line } from 'src/app/types/invGroup_line';
import { InvGroup_area } from 'src/app/types/invGroup_area.types';
import { forkJoin } from 'rxjs';
import { AcademicDomainService } from 'src/app/core/http/academic-domain/academic-domain.service';
import { InvGroup_academicDomain } from 'src/app/types/invGroup_academicDomain';
import { InvGroup_academicDomainService } from 'src/app/core/http/invGroup_academicDomain/invGroup_academicDomain.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-members',
  templateUrl: './lineModal.component.html',
  styleUrls: ['../../../../styles/modales.scss']
})
export class LineModalEdit implements OnInit {
  user: any;
  usuarios: any[] = [];
  isSearchClicked = false;
  userNotFound = false;
  lineas: any[] = [];
  areas: any[] = [];
  dominios: any[] = [];
  invGroup: InvGroupCompleteForm;
  loadingData: boolean = true;

  areasControl = new FormControl();
  lineasControl = new FormControl();
  dominiosControl = new FormControl();
  myForm: FormGroup;
  myForm2: FormGroup;
  groupId: number;
  currentUser: string;
  currentDate: Date;
  isLoading: boolean = true;
  selectMostrar: string = '';
  constructor(
    private fb: FormBuilder,
    private userService: UsuarioService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<LineModalEdit>,
    private invGroup_linesService: InvGroup_linesService,
    private areaService: AreaService,
    private lineService: LineService,
    private invGroup_areaService: InvGroup_areaService,
    private invGroup_academicDomainService: InvGroup_academicDomainService,
    private invGroupService: InvGroupService,
    private academicDomainService: AcademicDomainService,
    private snackBar: MatSnackBar,  // ← Agregado aquí
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.groupId = Number(sessionStorage.getItem('selectedId'));
    this.currentUser = this.authService.getUserName();
    this.currentDate = new Date();
    this.get(this.groupId);
    this.dominiosControl.valueChanges.subscribe((selectedDominios: any[]) => {
      this.updateAreasByDominios(selectedDominios);
    });

    this.areasControl.valueChanges.subscribe((selectedAreas: any[]) => {
      this.updateLineasByAreas(selectedAreas);
    });

    this.cargarFormularios();
  }

  get(id: number): void {
    this.invGroupService.getByIdAll(id).subscribe((data) => {
      this.invGroup = data;
      this.getLinesByArea();
    });
  }
  showToast(message: string, action: string = 'Cerrar', duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      verticalPosition: 'top',  // Puedes cambiarlo a 'bottom'
      horizontalPosition: 'right', // O 'left', 'center'
    });
  }

  cargarFormularios(): void {
    this.loadAreas();
    this.myForm = this.fb.group({
      lineas: this.lineasControl,
      areas: this.areasControl,
      dominios: this.dominiosControl,
    });

  }

  updateLineasByAreas(selectedAreas: any[]): void {
    this.lineas = [];

    if (selectedAreas?.length > 0) {
      selectedAreas.forEach((idArea) => {
        this.lineService.getLineByArea(idArea).subscribe((lineasArea: any[]) => {
          const nuevasLineas = lineasArea.filter(
            (linea) =>
              // No se repita en las ya agregadas
              !this.lineas.some((l) => l.idLinea === linea.idLinea) &&
              // No exista en this.invGroup.line
              !this.invGroup.line.some((l) => l.idLinea === linea.idLinea)
          );

          this.lineas = [...this.lineas, ...nuevasLineas];
        });
      });
    }

  }
  updateAreasByDominios(selectedDominios: any[]): void {
    this.areas = [];

    if (selectedDominios?.length > 0) {
      selectedDominios.forEach((idDomimioAcademico) => {
        this.areaService.getAreasByDominio(idDomimioAcademico).subscribe((areasDominio: any[]) => {
          const nuevasAreas = areasDominio.filter(
            (area) =>
              // No se repita en las ya agregadas
              !this.areas.some((a) => a.idArea === area.idArea) &&
              // No exista en this.invGroup.area
              !this.invGroup.area.some((a) => a.idArea === area.idArea)
          );

          this.areas = [...this.areas, ...nuevasAreas];
        });
      });
    }

  }

  getLinesByArea(): void {
    this.isLoading = false;
    if (this.invGroup?.area) {
      this.invGroup.area.forEach((area) => {
        area.lineas = this.invGroup.line.filter((line) => line.idArea === area.idArea);
      });
    }
  }
  getAreasByDominio(): void {
    if (this.invGroup?.academicDomain) {
      this.invGroup.academicDomain.forEach((academicDomain) => {
        academicDomain.areas = this.invGroup.area.filter((area) => area.idDominio === academicDomain.idDomimioAcademico);
      });
    }
  }
  agregar(tipo: string): void {
    this.selectMostrar = tipo;
    if (tipo === 'd') {
      this.loadDominios();
    } else if (tipo === 'a') {
      console.log(this.invGroup.area)
      let idDominios: any[] = []; // Inicializamos el arreglo
      this.invGroup.academicDomain.forEach((dominioAcademico) => {
        idDominios.push(dominioAcademico.idDomimioAcademico);
      });
      this.updateAreasByDominios(idDominios);
    } else if (tipo === 'l') {
      let idAreas: any[] = []; // Inicializamos el arreglo
      this.invGroup.area.forEach((area) => {
        idAreas.push(area.idArea);
      });
      this.updateLineasByAreas(idAreas);
    }
  }

  Enviar(): void {
    console.log('fuera', this.selectMostrar)
    this.isLoading = true;
    if (this.selectMostrar === 'd') {
      this.saveDominio(this.groupId);
      this.saveArea(this.groupId);
      this.saveLine(this.groupId);
    } else if (this.selectMostrar === 'a') {
      this.saveArea(this.groupId);
      this.saveLine(this.groupId);
    } else if (this.selectMostrar === 'l') {
      console.log(this.selectMostrar)
      this.saveLine(this.groupId);
    }


  }
  private saveDominio(id: number): void {
    const dominiosSeleccionados = this.dominiosControl.value;
    if (dominiosSeleccionados?.length > 0) {
      const requests = dominiosSeleccionados.map(dominiosId => {
        const domCreaForm: InvGroup_academicDomain = {
          idGrupo: id,
          idDomAcad: dominiosId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        };
        return this.invGroup_academicDomainService.createAcadCreaForm(domCreaForm);
      });

      forkJoin(requests).subscribe(() => {
        this.showToast('Dominios agregados con éxito');
        this.get(this.groupId);
        this.myForm.reset();
        this.selectMostrar = null;

      }, () => {
        this.showToast('Error al agregar dominios', 'Cerrar', 5000);
      });
    }
  }


  private saveLine(id: number): void {
    const lineasSeleccionadas = this.lineasControl.value;
    if (lineasSeleccionadas?.length > 0) {
      const requests = lineasSeleccionadas.map(lineasId => {
        const lineCreaForm: InvGroup_line = {
          idGrupo: id,
          idLinea: lineasId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        };
        return this.invGroup_linesService.createInvGroup_lineForm(lineCreaForm);
      });

      forkJoin(requests).subscribe(() => {
        this.showToast('Líneas agregadas con éxito');
        this.get(this.groupId);
        this.myForm.reset();
        this.selectMostrar = null;


      }, () => {
        this.showToast('Error al agregar líneas', 'Cerrar', 5000); this.dialogRef.close(true)

      });
    }
  }

  private saveArea(id: number): void {
    const areasSeleccionadas = this.areasControl.value;
    if (areasSeleccionadas?.length > 0) {
      const requests = areasSeleccionadas.map(areasId => {
        const areaForm: InvGroup_area = {
          idGrupo: id,
          idArea: areasId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        };
        return this.invGroup_areaService.createAreaCreaForm(areaForm);
      });

      forkJoin(requests).subscribe(() => {
        this.showToast('Áreas agregadas con éxito');
        this.get(this.groupId);
        this.myForm.reset();
        this.selectMostrar = null;
      }, () => {
        this.showToast('Error al agregar áreas', 'Cerrar', 5000);
      });
    }
  }


  loadAreas(): void {
    this.areaService.getAll().subscribe((data) => {
      this.areas = data.filter((area) => area.estado === true);
      this.loadingData = false;
    });
  }
  loadDominios(): void {
    this.academicDomainService.getAll().subscribe((data) => {
      this.dominios = data.filter(
        (dominio) =>
          dominio.estado === true &&
          !this.invGroup.academicDomain.some((d) => d.idDomimioAcademico === dominio.idDomimioAcademico)
      );
      this.loadingData = false;
    });
    
  }
  loadLineas(): void {
    this.lineService.getAll().subscribe((data) => {
      this.lineas = data.filter((linea) => linea.estado === true);
      this.loadingData = false;
    });
  }
  onClickNo(user: any): void {
    this.dialogRef.close(user);
  }
  deleteLinea(idLinea: number): void {
    this.isLoading = true;
    this.invGroup_linesService.delete(this.groupId, idLinea).subscribe(() => {
      this.showToast('Línea eliminada con éxito');
      this.get(this.groupId);
      this.isLoading = false;
    }, () => {
      this.showToast('Error al eliminar la línea', 'Cerrar', 5000);
      this.isLoading = false;
    });
  }

  deleteDominio(idDominio: any): void {
    this.isLoading = true;
    this.invGroup_academicDomainService.delete(this.groupId, idDominio).subscribe(() => {
      this.get(this.groupId);
      this.isLoading = false;
      this.showToast('Dominio y áreas y líneas asociadas eliminadas correctamente');
    }, () => {
      this.isLoading = false;
      this.showToast('Error al eliminar el dominio', 'Cerrar', 5000);
    });
  }

  deleteArea(idArea: any): void {
    this.isLoading = true;

    this.invGroup_areaService.delete(this.groupId, idArea).subscribe(() => {
      this.get(this.groupId);
      this.isLoading = false;
      this.showToast('Área y líneas asociadas eliminadas correctamente');
    }, () => {
      this.isLoading = false;
      this.showToast('Error al eliminar la área', 'Cerrar', 5000);
    });
  }
}

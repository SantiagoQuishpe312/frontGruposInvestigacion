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
  selectMostrar: string='';
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

  cargarFormularios(): void {
    this.loadAreas();
    this.myForm = this.fb.group({
      lineas: this.lineasControl,
      areas: this.areasControl,
      dominios: this.dominiosControl,
    });
    this.myForm2 = this.fb.group({
      lineas: this.lineasControl,
      areas: this.areasControl,
    });
  }

  updateLineasByAreas(selectedAreas: any[]): void {
    this.lineas = [];
    if (selectedAreas?.length > 0) {
      selectedAreas.forEach((idArea) => {
        this.lineService.getLineByArea(idArea).subscribe((lineasArea: any[]) => {
          this.lineas = [
            ...this.lineas,
            ...lineasArea.filter(
              (linea) => !this.lineas.some((l) => l.idLinea === linea.idLinea)
            ),
          ];
          this.isLoading = false;
        });
      });
    }
  }
  updateAreasByDominios(selectedDominios: any[]): void {
    this.areas = [];
    console.log(selectedDominios)
    if (selectedDominios?.length > 0) {
      selectedDominios.forEach((idDomimioAcademico) => {
        this.areaService.getAreasByDominio(idDomimioAcademico).subscribe((areasDominio: any[]) => {
          this.areas = [
            ...this.areas,
            ...areasDominio.filter(
              (area) => !this.areas.some((a) => a.idArea === area.idArea)
            ),
          ];
        });
      });
    }
  }

  getLinesByArea(): void {
    this.isLoading = false;
    if (this.invGroup?.area) {
      this.invGroup.area.forEach((area) => {
        area.lineas = this.invGroup.line.filter((line) => line.idArea === area.idArea);
        console.log(area.nombreArea);
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
    this.selectMostrar=tipo;
    if (tipo === 'd') {
      this.loadDominios();
    }else if (tipo === 'a') {
      let idDominios: any[] = []; // Inicializamos el arreglo
      this.invGroup.academicDomain.forEach((dominioAcademico) => {
        idDominios.push(dominioAcademico.idDomimioAcademico); 
      }); 
      this.updateAreasByDominios(idDominios);
    }else if(tipo === 'l') {
      let idAreas: any[] = []; // Inicializamos el arreglo
      this.invGroup.area.forEach((area) => {
        idAreas.push(area.idArea); 
      }); 
      this.updateLineasByAreas(idAreas);
    }
  }

  Enviar(): void {
    if (this.myForm.valid) {
      this.isLoading = true;
      if (this.selectMostrar === 'd') {
        this.saveDominio(this.groupId);
        this.saveArea(this.groupId);
        this.saveLine(this.groupId);
      } else if (this.selectMostrar === 'a') {
        this.saveArea(this.groupId);
      } else if (this.selectMostrar === 'l') {
        this.saveLine(this.groupId);
      }

      this.dialogRef.close(true)
    }
  }
  private saveDominio(id: number): void {
    const dominiosSeleccionados = this.dominiosControl.value;
    if (dominiosSeleccionados?.length > 0) {
      dominiosSeleccionados.forEach((dominiosId: number) => {
        const domCreaForm: InvGroup_academicDomain = {
          idGrupo: id,
          idDomAcad: dominiosId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.invGroup_academicDomainService.createAcadCreaForm(domCreaForm).subscribe(
          (response) => {
          }
        );
      });
    } else {
    }
  }

  private saveLine(id: number): void {
    const lineasSeleccionadas = this.lineasControl.value;
    if (lineasSeleccionadas?.length > 0) {
      lineasSeleccionadas.forEach((lineasId: number) => {
        const lineCreaForm: InvGroup_line = {
          idGrupo: id,
          idLinea: lineasId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null,
        };
        this.invGroup_linesService.createInvGroup_lineForm(lineCreaForm).subscribe();
      });
    }
  }

  private saveArea(id: number): void {
    const areasSeleccionadas = this.areasControl.value;
    if (areasSeleccionadas?.length > 0) {
      areasSeleccionadas.forEach((areasId: number) => {
        const areaForm: InvGroup_area = {
          idGrupo: id,
          idArea: areasId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null,
        };
        this.invGroup_areaService.createAreaCreaForm(areaForm).subscribe();
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
      this.dominios = data.filter((dominio) => dominio.estado === true);
      this.loadingData = false;
      console.log(this.dominios);
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
    this.invGroup_linesService.delete(this.groupId, idLinea).subscribe();
    this.get(this.groupId);

  }
  deleteDominio(idDominio: number): void {
    this.invGroup_academicDomainService.delete(this.groupId, idDominio).subscribe();
    this.invGroup_areaService.delete(this.groupId, idDominio).subscribe();
    this.invGroup_linesService.delete(this.groupId, idDominio).subscribe();
    this.get(this.groupId);
  }
  deleteArea(idArea: number): void {
    forkJoin([
      this.invGroup_areaService.delete(this.groupId, idArea),
      this.invGroup_linesService.deleteByArea(idArea)
    ]).subscribe({
      next: () => {
        this.get(this.groupId); // Se ejecuta solo después de que ambas eliminaciones terminen
      },
      error: (err) => {
        console.error('Error al eliminar el área y sus líneas asociadas:', err);
      }
    });
  }

}

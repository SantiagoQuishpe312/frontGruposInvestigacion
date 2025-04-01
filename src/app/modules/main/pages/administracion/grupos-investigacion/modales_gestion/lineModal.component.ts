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
  groupId: number;
  currentUser: string;
  currentDate: Date;
  isLoading: boolean=true;
  constructor(
    private fb: FormBuilder,
    private userService: UsuarioService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<LineModalEdit>,
    private invGroup_linesService: InvGroup_linesService,
    private areaService: AreaService,
    private lineService: LineService,
    private invGroup_areaService: InvGroup_areaService,
    private invGroupService: InvGroupService,
    private academicDomainService:AcademicDomainService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

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
    this.isLoading = false;
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
          this.lineas = [
            ...this.lineas,
            ...lineasArea.filter(
              (linea) => !this.lineas.some((l) => l.idLinea === linea.idLinea)
            ),
          ];
        });
      });
    }
  }
  updateAreasByDominios(selectedDominios: any[]): void {
    this.areas = [];
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

  Enviar(): void {
    if (this.myForm.valid) {
      this.isLoading = true;
      this.saveArea(this.groupId);
      this.saveLine(this.groupId);
      this.dialogRef.close(true)
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
    });
  }

  onClickNo(user: any): void {
    this.dialogRef.close(user);
  }
  deleteLinea(idLinea: number): void {
    this.invGroup_linesService.delete(this.groupId, idLinea).subscribe();
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

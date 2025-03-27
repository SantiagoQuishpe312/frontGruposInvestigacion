import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { MatDialog } from '@angular/material/dialog';
import { InvGroupCompleteForm } from 'src/app/types/invGroup.types';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { Usuario } from 'src/app/types/usuario.types';
import { LineModalEdit } from './modales_gestion/lineModal.component';
import { MembersModalEdit } from './modales_gestion/membersModal.component';
import { GroupModalEdit } from './modales_gestion/groupModal.component';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-grupos-investigacion-crud',
  templateUrl: './detalle-gi.component.html',
  styleUrls: ['../modulos.component.scss'],
})
export class DetalleGIComponent implements OnInit {
  invGroup: InvGroupCompleteForm;
  coordinador: Usuario;
  isLoading: boolean = true;
  displayedColumns: string[] = ['pais', 'nombreDocente', 'funcion', 'sede', 'universidadCentro'];
  dataSource = new MatTableDataSource<any>(); // Fuente de datos para la tabla
  id: number;
  token: string;
  imagenUrl: SafeResourceUrl | undefined;
  @ViewChild(MatSort) sort!: MatSort;
  usuariosPorFuncion: { [key: string]: number } = {};
  usuariosPorGradoAcademico:{ [key: string]: number } = {};
  usuariosPorGenero: { [key: string]: number } = {};
  usuariosPorDepartamento: { [key: string]: number } = {};
  fullDataSource: any[] = [];
  totalUsuarios: number = 0;
  funcionControl=new FormControl('');
  gradoControl=new FormControl('');
  generoControl=new FormControl('');
  departamentoControl=new FormControl('');
  funcion:string[]=[];
  grado:string[] = [];
  genero:string[]=[];
  departamento:string[] = [];

  funcionCountDataSource = new MatTableDataSource<{ funcion: string, cantidad: number }>([]);
  gradoCountDataSource = new MatTableDataSource<{ grado: string, cantidad: number }>([]);
  generoCountDataSource = new MatTableDataSource<{ genero: string, cantidad: number }>([]);
  departamentoCountDataSource = new MatTableDataSource<{ departamento: string, cantidad: number }>([]);
  totalFuncionCount: number = 0;
  totalGradoCount: number = 0;
  totalGeneroCount: number = 0; 
  totalDepartamentoCount: number = 0;
  // Variables para los filtros:

  constructor(
    private router: Router,
    private giService: InvGroupService,
    private annexesService: AnnexesService,
    private dialog: MatDialog,
    private documentsService: DocumentsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.id = Number(sessionStorage.getItem('selectedId'));
    this.token = sessionStorage.getItem('access_token')!;
    this.get(this.id);
    this.getImage();
    this.funcionControl.valueChanges.subscribe(() => this.aplicarFiltro());
    this.gradoControl.valueChanges.subscribe(() => this.aplicarFiltro());
    this.generoControl.valueChanges.subscribe(() => this.aplicarFiltro());
    this.departamentoControl.valueChanges.subscribe(() => this.aplicarFiltro());
  }

  get(id: number) {
    this.giService.getByIdAll(id).subscribe((data) => {
      this.totalUsuarios=data.users.length+1;
     // this.usuariosPorDepartamento=this.contarPorCategoria(data.users)
     this.usuariosPorFuncion=this.contarPorCategoria(data.users,'funcion'); 
     {//data.users.user este arreglo contiene la }
     this.invGroup = data;
      const dataGroup = [
        ...data.users.map(user => ({
          ...user,
          funcion: 'Miembro'
        })),
        { ...data.coordinador, funcion: 'Coordinador' }
      ];
    

      
      // Contar usuarios por función
      this.contarUsuariosPorFuncion(dataGroup);
  
      this.dataSource = new MatTableDataSource(dataGroup);
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: any, filter: string) =>
        data.nombreDocente.toLowerCase().includes(filter);}
    });
  }
  
  obtenerGrados() {
    // Devuelve las claves (grados académicos) del objeto usuariosPorGradoAcademico
    return Object.keys(this.usuariosPorGradoAcademico);
  }

  obtenerTotal() {
    return Object.values(this.usuariosPorGradoAcademico)
      .reduce((total, cantidad) => +total + (Number(cantidad) || 0), 0);
  }
  
  
  contarUsuariosPorFuncion(data: any[]) {
    // Contar los diferentes tipos de función
    this.usuariosPorFuncion = data.reduce((acc, user) => {
      const key = user.funcion || 'Miembro'; // Si no tiene función, será 'Miembro'
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }


  aplicarFiltro() {
    let filterData=[...this.fullDataSource];
    const selectedDepartment=this.departamentoControl.value?.trim().toLowerCase||'';
    if (selectedDepartment) {
      filterData = filterData.filter(item => item.departamento === selectedDepartment);
    }
    const selectedGenero=this.generoControl.value?.trim().toLowerCase||'';
    if (selectedGenero) {
      filterData = filterData.filter(item => item.genero === selectedGenero);
    }
    const selectedGrado=this.gradoControl.value?.trim().toLowerCase||'';
    if (selectedGrado) {
      filterData = filterData.filter(item => item.grado === selectedGrado);
    }
    const selectedFuncion=this.funcionControl.value?.trim().toLowerCase||'';
    if (selectedFuncion) {
      filterData = filterData.filter(item => item.funcion === selectedFuncion);
    }
    this.dataSource.data = filterData;
    this.actualizarConteoFuncion(filterData);
    this.actualizarConteoGrado(filterData);
    this.actualizarConteoGenero(filterData);
    this.actualizarConteoDepartamento(filterData);
  }
  actualizarConteoDepartamento(filterData: any[]) {
    const conteo=this.contarPorCategoria(filterData,'departamento');
    this.totalDepartamentoCount=Object.values(conteo).reduce((sum, value) => sum + value, 0);
    this.departamentoCountDataSource.data = [
      ...Object.keys(conteo).map(departamento => ({
        departamento,
        cantidad: conteo[departamento]
      })),
      //{ departamento: 'Total', cantidad: this.totalDepartamentoCount }
    ];
  }
  contarPorCategoria(data: any[], campo: string):{[key: string]: number} {
    return data.reduce((acc, item) => {
      const key = item[campo] || 'Desconocido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }
  actualizarConteoGenero(filterData: any[]) {
    const conteo=this.contarPorCategoria(filterData,'genero');
    this.totalGeneroCount=Object.values(conteo).reduce((sum, value) => sum + value, 0);
    this.generoCountDataSource.data = [
      ...Object.keys(conteo).map(genero => ({
        genero,
        cantidad: conteo[genero]
      })),
      //{ genero: 'Total', cantidad: this.totalGeneroCount }
    ];
  }
  actualizarConteoGrado(filterData: any[]) {
    const conteo=this.contarPorCategoria(filterData,'grado');
    this.totalGradoCount=Object.values(conteo).reduce((sum, value) => sum + value, 0);
    this.gradoCountDataSource.data = [
      ...Object.keys(conteo).map(grado => ({
        grado,
        cantidad: conteo[grado]
      })),
      //{ grado: 'Total', cantidad: this.totalGradoCount }
    ];
  }
  actualizarConteoFuncion(filterData: any[]) {
    const conteo=this.contarPorCategoria(filterData,'funcion');
    this.totalFuncionCount=Object.values(conteo).reduce((sum, value) => sum + value, 0);
    this.funcionCountDataSource.data = [
      ...Object.keys(conteo).map(funcion => ({
        funcion,
        cantidad: conteo[funcion]
      })),
      //{ funcion: 'Total', cantidad: this.totalFuncionCount }
    ];
  }


  getImage() {
    this.annexesService.getByGroupType(this.id, 'imagen_GI').subscribe((data) => {
      if (data && data.length > 0) {
        this.documentsService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo)
          .subscribe({
            next: (blob) => {
              const imageBlob = new Blob([blob], { type: 'image/jpeg' });
              const imageUrl = window.URL.createObjectURL(imageBlob);
              this.imagenUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error al cargar la imagen:', err);
              this.isLoading = false;
            }
          });
      } else {
        console.warn('No se encontraron anexos para el grupo.');
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['main/admin']);
  }

  EditLine(): void {
    const dialogRef = this.dialog.open(LineModalEdit, { width: '80%', height: '70%' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.get(this.id);
    });
  }

  EditMembers(): void {
    const dialogRef = this.dialog.open(MembersModalEdit, { width: '80%', height: '70%' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.get(this.id);
    });
  }

  EditGroup(): void {
    const dialogRef = this.dialog.open(GroupModalEdit, { width: '80%', height: '70%' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.get(this.id);
    });
  }
  enlace(url: string) {
    this.router.navigateByUrl(`main/${url}`);
  }
}

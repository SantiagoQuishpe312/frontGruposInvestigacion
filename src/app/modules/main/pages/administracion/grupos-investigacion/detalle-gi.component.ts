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
  usuariosPorGradoAcademico:{};
  availableGeneros: string[] = [];
  availableGrados: string[] = [];

  // Variables para los filtros:
  selectedFuncion: string = '';
  selectedGenero: string = '';
  selectedGrado: string = '';

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
  }

  get(id: number) {
    this.giService.getByIdAll(id).subscribe((data) => {
      this.invGroup = data;
      const dataGroup = [
        ...data.users.map(user => ({
          ...user,
          funcion: 'Miembro'
        })),
        { ...data.coordinador, funcion: 'Coordinador' }
      ];
  
      this.availableGeneros = Array.from(new Set(
        dataGroup.map((user: any) => user.genero).filter(Boolean)
      ));
      this.availableGrados = Array.from(new Set(
        dataGroup.map((user: any) => user.grado).filter(Boolean)
      ));
      

      this.usuariosPorGradoAcademico = dataGroup.reduce((acc, usuario) => {
        const grado = usuario.grado;
        if (!acc[grado]) {
          acc[grado] = 0;
        }
        acc[grado]++;
        return acc;
      }, {});
      // Contar usuarios por función
      this.contarUsuariosPorFuncion(dataGroup);
  
      this.dataSource = new MatTableDataSource(dataGroup);
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: any, filter: string) =>
        data.nombreDocente.toLowerCase().includes(filter);
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
    const filtroFuncion = this.selectedFuncion.toLowerCase().trim();
    const filtroGenero = this.selectedGenero.toLowerCase().trim();
    const filtroGrado = this.selectedGrado.toLowerCase().trim();

    // Filtro combinado que evalúa cada propiedad de forma independiente:
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const matchesFuncion = !filtroFuncion || data.funcion?.toLowerCase().includes(filtroFuncion);
      const matchesGenero = !filtroGenero || data.genero?.toLowerCase().includes(filtroGenero);
      const matchesGrado = !filtroGrado || data.grado?.toLowerCase().includes(filtroGrado);

      return matchesFuncion && matchesGenero && matchesGrado;
    };

    // Forzar la actualización del filtro:
    this.dataSource.filter = '' + Math.random();
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

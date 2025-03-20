import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-grupos-investigacion-crud',
  templateUrl: './grupos-investigacion.component.html',
  styleUrls: ['../modulos.component.scss'],
})
export class GruposControlComponent implements OnInit {
  displayedColumns: string[] = [
    'index', 'nombreGrupoInv', 'acronimoGrupoinv', 'departamento', 'sede', 'coordinador', 'abrir'
  ];
  chartDepartamento: Chart | undefined;
  chartSede: Chart | undefined;
  gruposPorDepartamento: { [key: string]: number } = {};
  gruposPorSede: { [key: string]: number } = {};

  dataSource = new MatTableDataSource<InvGroupForm>();
  fullDataSource: InvGroupForm[] = [];
  isLoading: boolean = true;

  searchControl = new FormControl(); 
  departmentControl = new FormControl('');
  sedeControl = new FormControl('');
  
  usuarioNombre: { [key: number]: string } = {};
  totalGrupos: number = 0;
  departments: string[] = [];
  sedes: string[] = [];

  departmentsCountDataSource = new MatTableDataSource<{ departamento: string, cantidad: number }>([]);
  sedesCountDataSource = new MatTableDataSource<{ sede: string, cantidad: number }>([]);

  totalSedesCount: number = 0;
  totalDepartamentosCount: number = 0;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private giService: InvGroupService,
    private usuarioService: UsuarioService
  ) { Chart.register(...registerables); }

  ngOnInit() {
    this.get();

    this.searchControl.valueChanges.subscribe(value => this.applyFilters());
    this.departmentControl.valueChanges.subscribe(() => this.applyFilters());
    this.sedeControl.valueChanges.subscribe(() => this.applyFilters());
    
  }

  get() {
    this.giService.getAll().subscribe((data) => {
      this.totalGrupos = data.length;
      this.gruposPorDepartamento = this.contarPorCategoria(data, 'departamento');
      this.gruposPorSede = this.contarPorCategoria(data, 'sede');

      this.actualizarConteoDepartamentos(data);
      this.actualizarConteoSedes(data);

      this.departments = Array.from(new Set(data.map(grupo => grupo.departamento))).filter(Boolean).sort();
      this.sedes = Array.from(new Set(data.map(grupo => grupo.sede))).filter(Boolean).sort();

      const promises = data.map((grupo) =>
        this.getCoordinador(grupo.idCoordinador).then(nombre => {
          grupo['nombreCoordinador'] = nombre;
          return grupo;
        })
      );

      Promise.all(promises).then(() => {
        this.fullDataSource = [...data];
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: InvGroupForm, filter: string) => {
          return data.nombreGrupoInv.toLowerCase().includes(filter);
        };

        this.isLoading = false;
      });
    });
  }

  applyFilters() {
    let filteredData = [...this.fullDataSource];

    const searchValue = this.searchControl.value?.trim().toLowerCase() || '';
    if (searchValue) {
      filteredData = filteredData.filter(item => item.nombreGrupoInv.toLowerCase().includes(searchValue));
    }

    const selectedDepartment = this.departmentControl.value;
    if (selectedDepartment) {
      filteredData = filteredData.filter(item => item.departamento === selectedDepartment);
    }

    const selectedSede = this.sedeControl.value;
    if (selectedSede) {
      filteredData = filteredData.filter(item => item.sede === selectedSede);
    }

    this.dataSource.data = filteredData;
    this.actualizarConteoDepartamentos(filteredData);
    this.actualizarConteoSedes(filteredData);
    this.totalGrupos = filteredData.length;
  }

  actualizarConteoDepartamentos(data: InvGroupForm[]) {
    const conteo = this.contarPorCategoria(data, 'departamento');
    this.totalDepartamentosCount = Object.values(conteo).reduce((sum, value) => sum + value, 0);
    this.departmentsCountDataSource.data = [
      ...Object.keys(conteo).map(departamento => ({
        departamento,
        cantidad: conteo[departamento]
      })),
      //{ departamento: 'Total', cantidad: this.totalDepartamentosCount }
    ];
  }
  
  actualizarConteoSedes(data: InvGroupForm[]) {
    const conteo = this.contarPorCategoria(data, 'sede');
    this.totalSedesCount = Object.values(conteo).reduce((sum, value) => sum + value, 0);
    this.sedesCountDataSource.data = [
      ...Object.keys(conteo).map(sede => ({
        sede,
        cantidad: conteo[sede]
      })),
      //{ sede: 'Total', cantidad: this.totalSedesCount }
    ];
  }
  
  contarPorCategoria(data: any[], campo: string): { [key: string]: number } {
    return data.reduce((acc, item) => {
      const key = item[campo] || 'Desconocido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  
  async getCoordinador(id: number): Promise<string> {
    if (this.usuarioNombre[id]) {
      return this.usuarioNombre[id];
    }
    try {
      const usuario = await this.usuarioService.getById(id).toPromise();
      this.usuarioNombre[id] = usuario?.nombre || 'Usuario no encontrado';
    } catch {
      this.usuarioNombre[id] = 'Usuario no encontrado';
    }
    return this.usuarioNombre[id];
  }

  open(id: number): void {
    sessionStorage.setItem('selectedId', id.toString());
    this.router.navigate(['/main/detalleGrupo']);
  }

  add() {
    this.router.navigate(['/main/crearGI']);
  }
}

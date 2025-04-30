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
    this.chartDepartamento = this.renderChart(
      this.chartDepartamento,
      'chartDepartamento',
      conteo,
      'Grupos por Departamento'
    );
    
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
    this.chartSede = this.renderChart(
      this.chartSede,
      'chartSede',
      conteo,
      'Grupos por Sede'
    );
    
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
  private renderChart(
    chartRef: Chart | undefined,
    canvasId: string,
    dataMap: { [key: string]: number },
    label: string
  ): Chart {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    const dataLabels = Object.keys(dataMap);
    const dataValues = Object.values(dataMap);
  
    if (chartRef) {
      chartRef.destroy();
    }
  
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels: dataLabels,
        datasets: [{
          label,
          data: dataValues,
          backgroundColor: this.generateColors(dataLabels.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        layout: {
          padding: 20 // iguala el espacio alrededor
        },
        plugins: {
          legend: {
            position: 'right', // 👈 Coloca la leyenda a la derecha del gráfico
            labels: {
              font: {
                size: 7 // 👈 Tamaño más pequeño
              },
              boxWidth: 20,
              padding: 10
            }
          },
          
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
      
    });
  }
  
  
  private generateColors(count: number): string[] {
    const baseColors = [
      '#4caf50', // verde
      '#2196f3', // azul
      '#ff9800', // naranja
      '#e91e63', // rosado
      '#9c27b0', // morado
      '#f44336', // rojo
      '#00bcd4', // turquesa
      '#ffeb3b', // amarillo
      '#795548', // marrón
      '#3f51b5'  // índigo
    ];
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
  }
  
  
}

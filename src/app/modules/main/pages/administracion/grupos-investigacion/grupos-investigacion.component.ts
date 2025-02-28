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
    'index', 'nombreGrupoInv', 'acronimoGrupoinv', 'departamento', 'coordinador', 'abrir'
  ];
  chart: Chart | undefined;
  gruposPorDepartamento:{ [key: string]: number } = {};
  
  dataSource = new MatTableDataSource<InvGroupForm>();
  fullDataSource: InvGroupForm[] = [];
  isLoading: boolean = true;
  searchControl = new FormControl(); // Campo de búsqueda reactivo
  departmentControl = new FormControl('');
  usuarioNombre: { [key: number]: string } = {};
  totalGrupos: number = 0;
  departments: string[] = [];



  @ViewChild(MatSort) sort!: MatSort; // Habilitar ordenamiento

  constructor(
    private router: Router,
    private giService: InvGroupService,
    private usuarioService: UsuarioService
  ) {Chart.register(...registerables)}

  ngOnInit() {
    this.get();
    
    // Aplicar filtro en tiempo real
    this.searchControl.valueChanges.subscribe(value => {
      const searchValue = value?.trim().toLowerCase() || '';
      this.dataSource.filter = searchValue;
    });

   
    /*
    this.departmentControl.valueChanges.subscribe(value => {
      if (value) {
        this.dataSource.filter = value.trim().toLowerCase();
      }
    });*/

    this.departmentControl.valueChanges.subscribe(value => {
      if (value === '') {
        // Restaurar todos los datos originales cuando se selecciona "Todos los departamentos"
        this.dataSource.data = [...this.fullDataSource];
        
        // Aplicar el filtro de búsqueda si existe
        const searchValue = this.searchControl.value?.trim().toLowerCase() || '';
        if (searchValue) {
          this.dataSource.filter = searchValue;
        }
      } else {
        // Filtrar por departamento seleccionado
        this.dataSource.data = this.fullDataSource.filter(item => 
          item.departamento === value
        );
        
        // Aplicar filtro de búsqueda si existe
        const searchValue = this.searchControl.value?.trim().toLowerCase() || '';
        if (searchValue) {
          this.dataSource.filter = searchValue;
        }
      }
      
      // Actualizar contador de grupos
      this.totalGrupos = this.dataSource.filteredData.length;
    });
  }
  calcularTotal(datos:{[key: string]: number}):number{
      return Object.values(datos).reduce((acc,curr)=>acc+curr,0);
  }
/*
  get() {
    this.giService.getAll().subscribe((data) => {
      this.totalGrupos = data.length;
      
      this.departments = Array.from(new Set(data.map(grupo => grupo.departamento)))
        .filter(Boolean)
        .sort();
      
      data.forEach((grupo) => {
        this.getCoordinador(grupo.idCoordinador).then(nombre => {
          grupo['nombreCoordinador'] = nombre; // Agregar el nombre del coordinador al objeto
          this.dataSource.data = data;
          this.dataSource.sort = this.sort;

          this.dataSource.filterPredicate = (data: InvGroupForm, filter: string) => {
            return data.departamento.toLowerCase().includes(filter) || 
                   data.nombreGrupoInv.toLowerCase().includes(filter);
          };

        });
      });

      this.isLoading = false;
    });
  }
*/
get() {
  this.giService.getAll().subscribe((data) => {
    this.totalGrupos = data.length;
    this.gruposPorDepartamento=this.contarPorCategoria(data,'departamento');
    // Extraer la lista única de departamentos
    this.departments = Array.from(new Set(data.map(grupo => grupo.departamento)))
      .filter(Boolean)
      .sort();
      
    const promises = data.map((grupo) => {
      return this.getCoordinador(grupo.idCoordinador).then(nombre => {
        grupo['nombreCoordinador'] = nombre; // Agregar el nombre del coordinador al objeto
        return grupo;
      });
    });
    
    Promise.all(promises).then(() => {
      this.fullDataSource = [...data]; // Guardar copia de todos los datos
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
      
      // Configurar filterPredicate para el filtro de búsqueda por nombre
      this.dataSource.filterPredicate = (data: InvGroupForm, filter: string) => {
        return data.nombreGrupoInv.toLowerCase().includes(filter);
      };
      
      this.isLoading = false;
    });
  });
  this.crearGraficoDepartamentoPorGrupo();
}
contarPorCategoria(data: any[], campo: string): { [key: string]: number } {
  return data.reduce((acc, item) => {
    const key = item[campo] || 'Desconocido';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
}

crearGraficoDepartamentoPorGrupo() {
  if (this.chart) this.chart.destroy();

    const labels = Object.keys(this.gruposPorDepartamento);
    const values = Object.values(this.gruposPorDepartamento);

    this.chart = new Chart('grupoPorDepartamentoChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Grupos por Departamento',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
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

import { Component, OnInit } from '@angular/core';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { Chart, registerables } from 'chart.js';
import { InvGroupForm } from 'src/app/types/invGroup.types';
@Component({
  selector: 'vex-reportes-gi',
  templateUrl: './reportes-gi.component.html',
  styleUrls: ['./reportes-gi.component.scss']
})
export class ReportesGIComponent implements OnInit {
  chart: Chart | undefined;
  chart2: Chart | undefined;
  chart3: Chart | undefined;
  chart4: Chart | undefined;
  chart5: Chart | undefined;
  chart6: Chart | undefined;
  chart7: Chart | undefined;
  usuariosPorPais: { [key: string]: number } = {};
  usuariosPorGrado: { [key: string]: number } = {};
  usuariosPorDepartamento: { [key: string]: number } = {};
  usuariosPorSede: { [key: string]: number } = {};
  usuariosPorGenero: { [key: string]: number } = {};
  usuariosPorFuncion: { [key: string]: number } = {};
  usuariosPorTipo: { [key: string]: number } = {};
  invGroup: InvGroupForm;
  constructor(private giService: InvGroupService) {
    Chart.register(...registerables);
  }

  id: number;
  token: string;
  isLoading: boolean = true;
  ngOnInit(): void {
    this.id = Number(sessionStorage.getItem('selectedId'));
    this.token = sessionStorage.getItem('access_token')!;

    this.get(this.id);
  
  }

  calcularTotal(datos: { [key: string]: number }): number {
    return Object.values(datos).reduce((acc, curr) => acc + curr, 0);
  }
  get(id: number) {
    this.giService.getByIdAll(id).subscribe((data) => {
      const dataGroup = [
        ...data.users.map(user => ({
          ...user.user,  // Extraemos la información de 'user' (Usuario) de cada miembro
          ...user,  // También incluimos las propiedades de 'InvMemberForm' (fuera de 'user')
            // Añadimos la función 'Miembro'
        })),
        {
          ...data.coordinador,  // Extraemos directamente la información del coordinador
          tipo: 'COORDINADOR'  // Añadimos la función 'Coordinador'
        }
  
      ];
      this.invGroup = data.invGroup;
      this.isLoading = false;

      // Procesar datos
      this.usuariosPorPais = this.contarPorCategoria(dataGroup, 'nacionalidad');
      this.usuariosPorGrado = this.contarPorCategoria(dataGroup, 'grado');
      this.usuariosPorDepartamento = this.contarPorCategoria(dataGroup, 'departamento');
      this.usuariosPorSede = this.contarPorCategoria(dataGroup, 'sede');
      this.usuariosPorGenero = this.contarPorCategoria(dataGroup, 'genero');
      this.usuariosPorFuncion = this.contarPorCategoria(dataGroup, 'tipo');
      this.usuariosPorTipo = this.contarPorCategoria(dataGroup, 'status');
      this.crearGraficoUsuariosPorPais();
      this.crearGraficoUsuariosPorGrado();
      this.crearGraficoUsuariosPorDepartamento();
      this.crearGraficoUsuariosPorSede(); 
      this.crearGraficoUsuariosPorGenero();
      //this.crearGraficoUsuariosPorTipo();
      this.crearGraficoUsuariosPorFuncion();
    });
  }
  contarPorCategoria(data: any[], campo: string): { [key: string]: number } {
    return data.reduce((acc, item) => {
      const key = item[campo] || 'Desconocido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  crearGraficoUsuariosPorPais() {
    if (this.chart) this.chart.destroy();
  
    const datos = Object.entries(this.usuariosPorPais).sort((a, b) => b[1] - a[1]);
    const labels = datos.map(([label]) => label);
    const values = datos.map(([, value]) => value);
  
    this.chart = new Chart('usuariosPorPaisChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Investigadores por País',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          barThickness: 20,
          categoryPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  
  crearGraficoUsuariosPorGrado() {
    if (this.chart2) this.chart2.destroy();
  
    const datos = Object.entries(this.usuariosPorGrado).sort((a, b) => b[1] - a[1]);
    const labels = datos.map(([label]) => label);
    const values = datos.map(([, value]) => value);
  
    this.chart2 = new Chart('usuariosPorGradoChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Investigadores por Grado',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          barThickness: 20,
          categoryPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  
  crearGraficoUsuariosPorDepartamento() {
    if (this.chart3) this.chart3.destroy();
  
    const datos = Object.entries(this.usuariosPorDepartamento).sort((a, b) => b[1] - a[1]);
    const labels = datos.map(([label]) => label);
    const values = datos.map(([, value]) => value);
  
    this.chart3 = new Chart('usuariosPorDepartamentoChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Investigadores por Departamento',
          data: values,
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          barThickness: 20,
          categoryPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  
  crearGraficoUsuariosPorSede() {
    if (this.chart4) this.chart4.destroy();
  
    const datos = Object.entries(this.usuariosPorSede).sort((a, b) => b[1] - a[1]);
    const labels = datos.map(([label]) => label);
    const values = datos.map(([, value]) => value);
  
    this.chart4 = new Chart('usuariosPorSedeChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Investigadores por Sede',
          data: values,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          barThickness: 20,
          categoryPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  
  crearGraficoUsuariosPorGenero() {
    if (this.chart5) this.chart5.destroy();
  
    const datos = Object.entries(this.usuariosPorGenero).sort((a, b) => b[1] - a[1]);
    const labels = datos.map(([label]) => label);
    const values = datos.map(([, value]) => value);
  
    this.chart5 = new Chart('usuariosPorGeneroChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Investigadores por Género',
          data: values,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          barThickness: 20,
          categoryPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  /*
  crearGraficoUsuariosPorTipo() {
    if (this.chart6) this.chart6.destroy();
  
    // Paso 1: combinar labels y valores
    const datos = Object.entries(this.usuariosPorTipo);
  
    // Paso 2: ordenar por valor (descendente)
    datos.sort((a, b) => b[1] - a[1]);
  
    // Paso 3: separar labels y valores ordenados
    const labels = datos.map(([label]) => label);
    const values = datos.map(([, value]) => value);
  
    // Paso 4: crear el gráfico
    this.chart6 = new Chart('usuariosPorTipoChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Investigadores por Tipo',
          data: values,
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1 // Opcional: asegura que se vea bien si son enteros
            }
          }
        }
      }
    });
  }*/
  
    crearGraficoUsuariosPorFuncion() {
      if (this.chart7) this.chart7.destroy();
    
      const datos = Object.entries(this.usuariosPorFuncion).sort((a, b) => b[1] - a[1]);
      const labels = datos.map(([label]) => label);
      const values = datos.map(([, value]) => value);
    
      this.chart7 = new Chart('usuariosPorFuncionChart', {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Investigadores por Función',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barThickness: 20,
            categoryPercentage: 0.5
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    

}

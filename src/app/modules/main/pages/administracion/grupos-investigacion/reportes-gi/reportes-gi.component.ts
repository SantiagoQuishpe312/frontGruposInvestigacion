import { Component, OnInit } from '@angular/core';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { Chart, registerables } from 'chart.js';
@Component({
  selector: 'vex-reportes-gi',
  templateUrl: './reportes-gi.component.html',
  styleUrls: ['./reportes-gi.component.scss']
})
export class ReportesGIComponent implements OnInit {
  chart: Chart | undefined;
  usuariosPorPais: { [key: string]: number } = {};
  usuariosPorGrado: { [key: string]: number } = {};
  usuariosPorDepartamento: { [key: string]: number } = {};
  usuariosPorSede: { [key: string]: number } = {};
  usuariosPorGenero: { [key: string]: number } = {};

  constructor(private giService: InvGroupService) {
    Chart.register(...registerables);
  }

  id: number;
  token: string;

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
        ...data.users.map(user => ({ ...user, funcion: 'Miembro' })), 
        { ...data.coordinador, funcion: 'Coordinador' }
      ];

      // Procesar datos
      this.usuariosPorPais = this.contarPorCategoria(dataGroup, 'nacionalidad');
      this.usuariosPorGrado = this.contarPorCategoria(dataGroup, 'gradoAcademico');
      this.usuariosPorDepartamento = this.contarPorCategoria(dataGroup, 'departamento');
      this.usuariosPorSede = this.contarPorCategoria(dataGroup, 'sede');
      this.usuariosPorGenero = this.contarPorCategoria(dataGroup, 'genero');

      this.crearGraficoUsuariosPorPais();
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

    const labels = Object.keys(this.usuariosPorPais);
    const values = Object.values(this.usuariosPorPais);

    this.chart = new Chart('usuariosPorPaisChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Investigadores por País',
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

}

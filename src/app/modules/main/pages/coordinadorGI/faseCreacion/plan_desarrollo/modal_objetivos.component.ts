import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { Objectives } from 'src/app/types/specificobjectives.types';
import { ObjectivesService } from 'src/app/core/http/objectives/objectives.service';
import { StrategiesService } from 'src/app/core/http/strategies/strategies.service';
import { OdsService } from 'src/app/core/http/ods/ods.service';
import { Strategies } from 'src/app/types/strategies.types';
import { ODS } from 'src/app/types/ods.types';
@Component({
    selector: 'app-area',
    templateUrl: './modal_objetivos.component.html',
    styleUrls: ['../../../../styles/modales.scss']
})
export class ObjControl implements OnInit {
    currentUser: string;
    currentDate: Date = new Date();
    obj: Objectives[] = [];
    form: FormGroup;
    isSaved: boolean = false;
    isLoading: boolean = false;
    isEditing: boolean = false; // Variable para determinar si se está en modo edición
    estrategias:Strategies[]=[];
    ods:ODS[]=[];
    objetivoEspecifico:string;
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ObjControl>,
        private objService: ObjectivesService,
        private odsService: OdsService,
        private strategieService: StrategiesService,
        @Inject(MAT_DIALOG_DATA) public data: any, // Datos que vienen del componente de la tabla
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        this.loadData();
        this.objetivoEspecifico=this.data.objetivoEspecifico.objetivo;
        // Inicializar el formulario
        this.form = this.fb.group({
            estrategia: [1, Validators.required], // Estrategia seleccionada
            ods: [1, Validators.required]          // ODS seleccionado
          });

    }
    loadData(): void {
        this.strategieService.getByObj(this.data.objetivoInstitucional).subscribe((data) => {
          this.estrategias = data.filter(estrategia => estrategia.estado === true);
          console.log(this.data.objetivoEspecifico)

        });
        this.odsService.getAll().subscribe((data) => {
          this.ods = data;
        });
      }
    

      save(): void {
        const selectedEstrategiaId = this.form.value.estrategia;
        const selectedOdsId = this.form.value.ods;
      
        const selectedEstrategia = this.estrategias.find(e => e.idEstrategia === selectedEstrategiaId);
        const selectedOds = this.ods.find(o => o.id === selectedOdsId);
      
        const result = {
          estrategias: [{ id: selectedEstrategiaId, descripcion: selectedEstrategia?.estrategia }],
          ods: [{ id: selectedOdsId, descripcion: selectedOds?.ods }]
        };
      
        this.dialogRef.close(result);
      }
      
          onClickClose(): void {
        this.dialogRef.close();
      }
}

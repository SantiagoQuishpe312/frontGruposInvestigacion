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
import { ObjStrategiesODSService } from 'src/app/core/http/obj_strategies_ods/obj_strategies_ods.service';
import { Objectives_Strategies_Ods } from 'src/app/types/obj_strategies_ods.types';
import { SpecificObjetives } from 'src/app/types/specificObjetives.types';
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
    objetivoEspecifico:SpecificObjetives;
    idObjetivoEspecifico:number;
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ObjControl>,
        private objService: ObjectivesService,
        private odsService: OdsService,
        private objStrategiesService: ObjStrategiesODSService,
        private strategieService: StrategiesService,
        @Inject(MAT_DIALOG_DATA) public data: any, // Datos que vienen del componente de la tabla
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        this.loadData();
        this.objetivoEspecifico=this.data.objetivoEspecifico;
        // Inicializar el formulario
        this.form = this.fb.group({
            estrategia: [1, Validators.required], // Estrategia seleccionada
            ods: [1, Validators.required]          // ODS seleccionado
          });

    }
    loadData(): void {
        this.strategieService.getByObj(this.data.objetivoInstitucional).subscribe((data) => {
          this.estrategias = data.filter(estrategia => estrategia.estado === true);
          console.log(this.data.objetivoInstitucional)

        });
        this.odsService.getAll().subscribe((data) => {
          this.ods = data;
        });
      }
    

      save(): void {
        const selectedEstrategiaId = this.form.value.estrategia;
        const selectedOdsId = this.form.value.ods;
        const data:Objectives_Strategies_Ods={
          idObjetivoEspecifico:this.objetivoEspecifico.idObjetivo,
          idEstrategia:selectedEstrategiaId,
          idODS:selectedOdsId,
          usuarioCreacion:this.currentUser,
          fechaCreacion:this.currentDate,
          usuarioModificacion:null, 
          fechaModificacion:null
        }
        this.objStrategiesService.create(data).subscribe((response)=>{
          console.log(response)
          this.dialogRef.close(response);
        })
        
      
      }
      
          onClickClose(): void {
        this.dialogRef.close();
      }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudGruposFaseDiezComponent } from './solicitud-grupos-fase-diez.component';

describe('SolicitudGruposFaseDiezComponent', () => {
  let component: SolicitudGruposFaseDiezComponent;
  let fixture: ComponentFixture<SolicitudGruposFaseDiezComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitudGruposFaseDiezComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudGruposFaseDiezComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

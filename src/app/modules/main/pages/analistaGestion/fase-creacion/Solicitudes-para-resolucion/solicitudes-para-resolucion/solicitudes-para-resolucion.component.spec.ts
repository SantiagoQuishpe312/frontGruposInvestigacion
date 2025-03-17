import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesParaResolucionComponent } from './solicitudes-para-resolucion.component';

describe('SolicitudesParaResolucionComponent', () => {
  let component: SolicitudesParaResolucionComponent;
  let fixture: ComponentFixture<SolicitudesParaResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitudesParaResolucionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesParaResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

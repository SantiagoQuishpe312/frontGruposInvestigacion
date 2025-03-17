import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GruposParaResolucionComponent } from './grupos-para-resolucion.component';

describe('GruposParaResolucionComponent', () => {
  let component: GruposParaResolucionComponent;
  let fixture: ComponentFixture<GruposParaResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GruposParaResolucionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GruposParaResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostrarGrupoFaseNueveComponent } from './mostrar-grupo-fase-nueve.component';

describe('MostrarGrupoFaseNueveComponent', () => {
  let component: MostrarGrupoFaseNueveComponent;
  let fixture: ComponentFixture<MostrarGrupoFaseNueveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MostrarGrupoFaseNueveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MostrarGrupoFaseNueveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GruposAprobadosComponent } from './grupos-aprobados.component';

describe('GruposAprobadosComponent', () => {
  let component: GruposAprobadosComponent;
  let fixture: ComponentFixture<GruposAprobadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GruposAprobadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GruposAprobadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

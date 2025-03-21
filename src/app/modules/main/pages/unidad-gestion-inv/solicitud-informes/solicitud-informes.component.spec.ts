import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudInformesComponent } from './solicitud-informes.component';

describe('SolicitudInformesComponent', () => {
  let component: SolicitudInformesComponent;
  let fixture: ComponentFixture<SolicitudInformesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitudInformesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudInformesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

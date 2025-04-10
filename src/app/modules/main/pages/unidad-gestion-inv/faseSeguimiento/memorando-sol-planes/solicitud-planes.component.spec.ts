import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudPlanesComponent } from './solicitud-planes.component';

describe('SolicitudPlanesComponent', () => {
  let component: SolicitudPlanesComponent;
  let fixture: ComponentFixture<SolicitudPlanesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitudPlanesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudPlanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

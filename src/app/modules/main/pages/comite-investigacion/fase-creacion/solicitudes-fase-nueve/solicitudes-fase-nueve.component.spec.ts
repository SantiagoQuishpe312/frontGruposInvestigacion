import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesFaseNueveComponent } from './solicitudes-fase-nueve.component';

describe('SolicitudesFaseNueveComponent', () => {
  let component: SolicitudesFaseNueveComponent;
  let fixture: ComponentFixture<SolicitudesFaseNueveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitudesFaseNueveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesFaseNueveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

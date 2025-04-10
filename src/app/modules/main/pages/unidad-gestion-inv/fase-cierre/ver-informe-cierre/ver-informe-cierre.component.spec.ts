import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerInformeCierreComponent } from './ver-informe-cierre.component';

describe('VerInformeCierreComponent', () => {
  let component: VerInformeCierreComponent;
  let fixture: ComponentFixture<VerInformeCierreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerInformeCierreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerInformeCierreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnexosFaseCierreComponent } from './anexos-fase-cierre.component';

describe('AnexosFaseCierreComponent', () => {
  let component: AnexosFaseCierreComponent;
  let fixture: ComponentFixture<AnexosFaseCierreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnexosFaseCierreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnexosFaseCierreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

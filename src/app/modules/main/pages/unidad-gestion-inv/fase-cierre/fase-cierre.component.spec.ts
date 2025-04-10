import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaseCierreComponent } from './fase-cierre.component';

describe('FaseCierreComponent', () => {
  let component: FaseCierreComponent;
  let fixture: ComponentFixture<FaseCierreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaseCierreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseCierreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

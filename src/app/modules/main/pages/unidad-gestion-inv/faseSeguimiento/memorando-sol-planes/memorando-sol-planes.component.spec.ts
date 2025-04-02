import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorandoSolPlanesComponent } from './memorando-sol-planes.component';

describe('MemorandoSolPlanesComponent', () => {
  let component: MemorandoSolPlanesComponent;
  let fixture: ComponentFixture<MemorandoSolPlanesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorandoSolPlanesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemorandoSolPlanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorandoSolInformesComponent } from './memorando-sol-informes.component';

describe('MemorandoSolInformesComponent', () => {
  let component: MemorandoSolInformesComponent;
  let fixture: ComponentFixture<MemorandoSolInformesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorandoSolInformesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemorandoSolInformesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

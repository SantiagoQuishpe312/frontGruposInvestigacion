import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorandoDiezComponent } from './memorando-diez.component';

describe('MemorandoDiezComponent', () => {
  let component: MemorandoDiezComponent;
  let fixture: ComponentFixture<MemorandoDiezComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorandoDiezComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemorandoDiezComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

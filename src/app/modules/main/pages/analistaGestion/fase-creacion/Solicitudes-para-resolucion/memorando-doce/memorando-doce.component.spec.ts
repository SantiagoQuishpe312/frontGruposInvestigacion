import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorandoDoceComponent } from './memorando-doce.component';

describe('MemorandoDoceComponent', () => {
  let component: MemorandoDoceComponent;
  let fixture: ComponentFixture<MemorandoDoceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorandoDoceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemorandoDoceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

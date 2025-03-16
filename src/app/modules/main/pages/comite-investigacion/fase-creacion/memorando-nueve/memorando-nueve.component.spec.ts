import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorandoNueveComponent } from './memorando-nueve.component';

describe('MemorandoNueveComponent', () => {
  let component: MemorandoNueveComponent;
  let fixture: ComponentFixture<MemorandoNueveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorandoNueveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemorandoNueveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorandoOchoComponent } from './memorando-31.component';

describe('MemorandoOchoComponent', () => {
  let component: MemorandoOchoComponent;
  let fixture: ComponentFixture<MemorandoOchoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorandoOchoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemorandoOchoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

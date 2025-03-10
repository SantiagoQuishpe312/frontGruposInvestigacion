import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorandoCreacionVITTComponent } from './memorando-creacion-vitt.component';

describe('MemorandoCreacionVITTComponent', () => {
  let component: MemorandoCreacionVITTComponent;
  let fixture: ComponentFixture<MemorandoCreacionVITTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorandoCreacionVITTComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemorandoCreacionVITTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Memorando32Component } from './memorando32.component';

describe('Memorando32Component', () => {
  let component: Memorando32Component;
  let fixture: ComponentFixture<Memorando32Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Memorando32Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Memorando32Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

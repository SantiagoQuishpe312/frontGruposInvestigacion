import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Memorando34Component } from './memorando34.component';

describe('Memorando34Component', () => {
  let component: Memorando34Component;
  let fixture: ComponentFixture<Memorando34Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Memorando34Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Memorando34Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

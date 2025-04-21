import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Memorando33Component } from './memorando33.component';

describe('Memorando33Component', () => {
  let component: Memorando33Component;
  let fixture: ComponentFixture<Memorando33Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Memorando33Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Memorando33Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolCreacionComponent } from './sol-creacion.component';

describe('SolCreacionComponent', () => {
  let component: SolCreacionComponent;
  let fixture: ComponentFixture<SolCreacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolCreacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolCreacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

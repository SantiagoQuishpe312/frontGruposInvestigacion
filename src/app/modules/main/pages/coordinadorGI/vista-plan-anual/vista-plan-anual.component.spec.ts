import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaPlanAnualComponent } from './vista-plan-anual.component';

describe('VistaPlanAnualComponent', () => {
  let component: VistaPlanAnualComponent;
  let fixture: ComponentFixture<VistaPlanAnualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaPlanAnualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaPlanAnualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

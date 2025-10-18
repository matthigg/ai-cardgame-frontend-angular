import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeurodeckComponent } from './neurodeck.component';

describe('NeurodeckComponent', () => {
  let component: NeurodeckComponent;
  let fixture: ComponentFixture<NeurodeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeurodeckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeurodeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

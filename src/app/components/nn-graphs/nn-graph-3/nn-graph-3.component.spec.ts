import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph3Component } from './nn-graph-3.component';

describe('NnGraph3Component', () => {
  let component: NnGraph3Component;
  let fixture: ComponentFixture<NnGraph3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

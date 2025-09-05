import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph13Component } from './nn-graph-13.component';

describe('NnGraph13Component', () => {
  let component: NnGraph13Component;
  let fixture: ComponentFixture<NnGraph13Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph13Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph13Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

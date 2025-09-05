import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph2Component } from './nn-graph-2.component';

describe('NnGraph2Component', () => {
  let component: NnGraph2Component;
  let fixture: ComponentFixture<NnGraph2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

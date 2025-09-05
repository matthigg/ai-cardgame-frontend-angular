import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph4Component } from './nn-graph-4.component';

describe('NnGraph4Component', () => {
  let component: NnGraph4Component;
  let fixture: ComponentFixture<NnGraph4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

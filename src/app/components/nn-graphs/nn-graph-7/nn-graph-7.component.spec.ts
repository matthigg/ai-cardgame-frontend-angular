import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph7Component } from './nn-graph-7.component';

describe('NnGraph7Component', () => {
  let component: NnGraph7Component;
  let fixture: ComponentFixture<NnGraph7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph7Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

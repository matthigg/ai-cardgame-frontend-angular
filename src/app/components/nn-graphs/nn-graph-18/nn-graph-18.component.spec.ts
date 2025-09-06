import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph18Component } from './nn-graph-18.component';

describe('NnGraph18Component', () => {
  let component: NnGraph18Component;
  let fixture: ComponentFixture<NnGraph18Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph18Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph18Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

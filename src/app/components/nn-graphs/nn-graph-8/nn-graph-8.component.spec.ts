import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph8Component } from './nn-graph-8.component';

describe('NnGraph8Component', () => {
  let component: NnGraph8Component;
  let fixture: ComponentFixture<NnGraph8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph8Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

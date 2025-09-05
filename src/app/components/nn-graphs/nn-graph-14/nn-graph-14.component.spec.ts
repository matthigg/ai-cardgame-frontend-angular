import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph14Component } from './nn-graph-14.component';

describe('NnGraph14Component', () => {
  let component: NnGraph14Component;
  let fixture: ComponentFixture<NnGraph14Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph14Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph14Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

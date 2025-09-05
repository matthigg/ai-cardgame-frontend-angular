import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph9Component } from './nn-graph-9.component';

describe('NnGraph9Component', () => {
  let component: NnGraph9Component;
  let fixture: ComponentFixture<NnGraph9Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph9Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph9Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

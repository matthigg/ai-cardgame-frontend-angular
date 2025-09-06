import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph16Component } from './nn-graph-16.component';

describe('NnGraph16Component', () => {
  let component: NnGraph16Component;
  let fixture: ComponentFixture<NnGraph16Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph16Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph16Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

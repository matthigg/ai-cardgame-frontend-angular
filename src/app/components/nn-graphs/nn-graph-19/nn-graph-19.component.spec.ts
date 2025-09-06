import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph19Component } from './nn-graph-19.component';

describe('NnGraph19Component', () => {
  let component: NnGraph19Component;
  let fixture: ComponentFixture<NnGraph19Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph19Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph19Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

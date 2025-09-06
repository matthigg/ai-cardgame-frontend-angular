import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph15Component } from './nn-graph-15.component';

describe('NnGraph15Component', () => {
  let component: NnGraph15Component;
  let fixture: ComponentFixture<NnGraph15Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph15Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph15Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

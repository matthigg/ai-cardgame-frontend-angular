import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph11Component } from './nn-graph-11.component';

describe('NnGraph11Component', () => {
  let component: NnGraph11Component;
  let fixture: ComponentFixture<NnGraph11Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph11Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph11Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

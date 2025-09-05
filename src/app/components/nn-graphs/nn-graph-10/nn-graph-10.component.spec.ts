import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph10Component } from './nn-graph-10.component';

describe('NnGraph10Component', () => {
  let component: NnGraph10Component;
  let fixture: ComponentFixture<NnGraph10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph10Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph12Component } from './nn-graph-12.component';

describe('NnGraph12Component', () => {
  let component: NnGraph12Component;
  let fixture: ComponentFixture<NnGraph12Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph12Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph12Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

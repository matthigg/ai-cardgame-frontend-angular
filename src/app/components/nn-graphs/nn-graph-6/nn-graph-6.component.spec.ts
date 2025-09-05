import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph6Component } from './nn-graph-6.component';

describe('NnGraph6Component', () => {
  let component: NnGraph6Component;
  let fixture: ComponentFixture<NnGraph6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph6Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

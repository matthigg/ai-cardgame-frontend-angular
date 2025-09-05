import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph5Component } from './nn-graph-5.component';

describe('NnGraph5Component', () => {
  let component: NnGraph5Component;
  let fixture: ComponentFixture<NnGraph5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

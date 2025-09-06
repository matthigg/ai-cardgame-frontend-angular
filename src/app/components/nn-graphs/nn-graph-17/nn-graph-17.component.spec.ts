import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraph17Component } from './nn-graph-17.component';

describe('NnGraph17Component', () => {
  let component: NnGraph17Component;
  let fixture: ComponentFixture<NnGraph17Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraph17Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraph17Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

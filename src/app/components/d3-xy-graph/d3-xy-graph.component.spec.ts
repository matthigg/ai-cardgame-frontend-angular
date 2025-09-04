import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3XyGraphComponent } from './d3-xy-graph.component';

describe('D3XyGraphComponent', () => {
  let component: D3XyGraphComponent;
  let fixture: ComponentFixture<D3XyGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3XyGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3XyGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

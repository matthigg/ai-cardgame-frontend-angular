import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3BarChartComponent } from './d3-bar-chart.component';

describe('D3BarChartComponent', () => {
  let component: D3BarChartComponent;
  let fixture: ComponentFixture<D3BarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3BarChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3BarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

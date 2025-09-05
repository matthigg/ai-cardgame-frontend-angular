import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NnGraphComponent } from './nn-graph.component';

describe('NnGraphComponent', () => {
  let component: NnGraphComponent;
  let fixture: ComponentFixture<NnGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NnGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NnGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

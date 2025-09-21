import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavToggleButtonComponent } from './sidenav-toggle-button.component';

describe('SidenavToggleButtonComponent', () => {
  let component: SidenavToggleButtonComponent;
  let fixture: ComponentFixture<SidenavToggleButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavToggleButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidenavToggleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

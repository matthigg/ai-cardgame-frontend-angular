import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatureDetailsDialogComponent } from './creature-details-dialog.component';

describe('CreatureDetailsDialogComponent', () => {
  let component: CreatureDetailsDialogComponent;
  let fixture: ComponentFixture<CreatureDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatureDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatureDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

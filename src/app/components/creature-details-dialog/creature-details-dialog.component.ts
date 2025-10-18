import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-creature-details-dialog',
  imports: [ CommonModule, MatButtonModule, MatDialogModule ],
  templateUrl: './creature-details-dialog.component.html',
  styleUrls: ['./creature-details-dialog.component.scss']
})
export class CreatureDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreatureDetailsDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  get nnConfigKeys() {
    return Object.keys(this.data.nn_config || {});
  }

  get rewardKeys() {
    return Object.keys(this.data.reward_config || {});
  }
}

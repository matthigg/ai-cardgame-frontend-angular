import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../../services/recruitment/recruitment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-recruitment',
  imports: [ MatCardModule ],
  templateUrl: './recruitment.component.html',
  styleUrls: ['./recruitment.component.scss']
})
export class RecruitmentComponent implements OnInit {
  creatureTemplates: any[] = [];
  playerName = 'asdf'; // TODO: replace with logged-in player context

  constructor(
    private recruitmentService: RecruitmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.recruitmentService.getCreatureTemplates().subscribe({
      next: (data) => {
        this.creatureTemplates = Object.values(data);
      },
      error: (err) => {
        console.error('Failed to fetch creature templates:', err);
      }
    });
  }

  recruit(templateName: string): void {
    this.recruitmentService.recruitCreature(this.playerName, templateName).subscribe({
      next: (res) => {
        this.snackBar.open(`${templateName} recruited!`, 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Recruitment failed:', err);
        this.snackBar.open(`Failed to recruit ${templateName}`, 'Close', { duration: 2000 });
      }
    });
  }
}

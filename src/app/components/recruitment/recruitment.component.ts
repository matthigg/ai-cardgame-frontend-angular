import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecruitmentService } from '../../services/recruitment/recruitment.service';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-recruitment',
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './recruitment.component.html',
  styleUrls: ['./recruitment.component.scss']
})
export class RecruitmentComponent implements OnInit {
  // full template list (raw from backend)
  private allTemplates: any[] = [];

  // templates shown in the UI (filtered)
  creatureTemplates: any[] = [];

  playerName: string | undefined;

  private loginService = inject(LoginService);
  private recruitmentService = inject(RecruitmentService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    // 2) effect that re-runs whenever the userInfoSignal changes
    effect(() => {
      const player = this.loginService.userInfoSignal(); // read signal value
      // will set playerName (undefined if no player)
      this.playerName = player?.name;

      // compute owned template ids (defensive)
      const ownedTemplateIds = new Set<number>(
        (player?.creatures || [])
          .filter((c: any) => c.creature_template_id !== undefined)
          .map((c: any) => Number(c.creature_template_id))
      );

      // filter using creature_template_id on the templates
      this.creatureTemplates = this.allTemplates.filter((tmpl: any) => {
        // some templates may use 'creature_template_id' or 'id' — prefer creature_template_id
        const tmplId = tmpl.creature_template_id ?? tmpl.id;
        return !ownedTemplateIds.has(Number(tmplId));
      });
    });
  }

  ngOnInit(): void {
    // 1) load templates from backend once
    this.recruitmentService.getCreatureTemplates().subscribe({
      next: (data) => {
        // backend returns object mapping names -> template objects
        this.allTemplates = Object.values(data || {});
        // initial filter run (in case player already loaded)
        this.runFilter();
      },
      error: (err) => {
        console.error('Failed to fetch creature templates:', err);
      }
    });
  }

  // helper to run filter immediately after templates fetched
  private runFilter() {
    const player = this.loginService.userInfoSignal();
    const ownedTemplateIds = new Set<number>(
      (player?.creatures || [])
        .filter((c: any) => c.creature_template_id !== undefined)
        .map((c: any) => Number(c.creature_template_id))
    );

    this.creatureTemplates = this.allTemplates.filter((tmpl: any) => {
      const tmplId = tmpl.creature_template_id ?? tmpl.id;
      return !ownedTemplateIds.has(Number(tmplId));
    });
  }

  recruit(templateName: string): void {
    if (!this.playerName) {
      this.snackBar.open(`No player logged in`, 'Close', { duration: 2000 });
      return;
    }

    this.recruitmentService.recruitCreature(this.playerName, templateName).subscribe({
      next: (res) => {
        this.snackBar.open(`${templateName} recruited!`, 'Close', { duration: 2000 });

        // If backend returns the updated player object, update the signal so effect recomputes
        // Adapt this depending on your backend response shape:
        // - earlier suggestion returned { status, message, player }
        const updatedPlayer = res?.player ?? res?.player_data ?? res;
        if (updatedPlayer && typeof this.loginService.userInfoSignal?.set === 'function') {
          // update signal so filtering auto-runs
          (this.loginService.userInfoSignal as any).set(updatedPlayer);
        } else {
          // fallback: remove the recruited template from local view
          this.creatureTemplates = this.creatureTemplates.filter(t => t.name !== templateName);
        }
      },
      error: (err) => {
        console.error('Recruitment failed:', err);
        this.snackBar.open(`Failed to recruit ${templateName}`, 'Close', { duration: 2000 });
      }
    });
  }
}

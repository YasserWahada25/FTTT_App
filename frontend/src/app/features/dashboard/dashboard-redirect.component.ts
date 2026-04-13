import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="dashboard-redirect">
      <mat-spinner diameter="42"></mat-spinner>
    </div>
  `,
  styles: [
    `
      .dashboard-redirect {
        min-height: calc(100vh - 180px);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class DashboardRedirectComponent implements OnInit {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    void this.router.navigateByUrl(this.authService.getDefaultRouteForCurrentUser(), {
      replaceUrl: true,
    });
  }
}

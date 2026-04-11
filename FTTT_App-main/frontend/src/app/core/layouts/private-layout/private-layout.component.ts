import { Component, OnInit, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';
import { MENU_ITEMS, MenuItem } from '../../config/menu.config';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-private-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        CommonModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
        MatTooltipModule,
        MatBadgeModule,
    ],
    templateUrl: './private-layout.component.html',
    styleUrls: ['./private-layout.component.css'],
})
export class PrivateLayoutComponent implements OnInit {
    sidenavOpen = signal(true);
    isMobile = signal(false);
    currentUser: User | null = null;
    menuItems: MenuItem[] = [];
    currentYear = new Date().getFullYear();

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUser;
        this.filterMenuItems();
        this.checkScreenSize();
    }

    @HostListener('window:resize')
    onResize(): void {
        this.checkScreenSize();
    }

    private checkScreenSize(): void {
        const isMobile = window.innerWidth < 960;
        this.isMobile.set(isMobile);
        if (isMobile) {
            this.sidenavOpen.set(false);
        } else {
            this.sidenavOpen.set(true);
        }
    }

    private filterMenuItems(): void {
        this.menuItems = MENU_ITEMS.filter((item) => {
            if (!item.roles || item.roles.length === 0) return true;
            return this.authService.hasRole(item.roles);
        });
    }

    toggleSidenav(): void {
        this.sidenavOpen.update((v) => !v);
    }

    getRoleLabel(role: string): string {
        const labels: Record<string, string> = {
            ADMIN_FEDERATION: 'Admin Fédération',
            CLUB_MANAGER: 'Responsable Club',
            COACH: 'Entraîneur',
            PLAYER: 'Joueur',
            REFEREE: 'Arbitre',
        };
        return labels[role] || role;
    }

    getRoleColor(role: string): string {
        const colors: Record<string, string> = {
            ADMIN_FEDERATION: 'role-admin',
            CLUB_MANAGER: 'role-manager',
            COACH: 'role-coach',
            PLAYER: 'role-player',
            REFEREE: 'role-referee',
        };
        return colors[role] || '';
    }

    getInitials(user: User): string {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    logout(): void {
        this.authService.logout();
    }
}

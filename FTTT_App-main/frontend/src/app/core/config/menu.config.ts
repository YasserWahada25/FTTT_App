import { UserRole } from '../models/user.model';

export interface MenuItem {
    label: string;
    icon: string;
    route?: string;
    roles?: UserRole[];
    children?: MenuItem[];
    divider?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
    {
        label: 'Tableau de Bord',
        icon: 'dashboard',
        route: '/app/dashboard',
    },
    {
        label: 'Utilisateurs',
        icon: 'people',
        route: '/app/users',
        roles: ['ADMIN_FEDERATION'],
    },
    {
        label: 'Clubs',
        icon: 'sports_tennis',
        route: '/app/clubs',
        roles: ['ADMIN_FEDERATION', 'CLUB_MANAGER'],
    },
    {
        label: 'Mon Profil',
        icon: 'account_circle',
        route: '/app/profile/me',
    },
    {
        label: 'Profils',
        icon: 'manage_accounts',
        route: '/app/profiles',
        roles: ['ADMIN_FEDERATION', 'CLUB_MANAGER'],
    },
    {
        label: 'Licences',
        icon: 'badge',
        route: '/app/licenses',
        roles: ['ADMIN_FEDERATION'],
    },
    {
        label: 'Mes Licences',
        icon: 'badge',
        route: '/app/licenses/my',
        roles: ['PLAYER', 'CLUB_MANAGER'],
    },
    {
        label: 'Compétitions',
        icon: 'emoji_events',
        route: '/app/competitions',
    },
    {
        label: 'Matchs',
        icon: 'sports',
        route: '/app/matches',
    },
    {
        label: 'Classements',
        icon: 'leaderboard',
        route: '/app/rankings',
    },
    {
        label: 'Terrains',
        icon: 'stadium',
        route: '/app/venues',
        roles: ['ADMIN_FEDERATION', 'CLUB_MANAGER'],
    },
];

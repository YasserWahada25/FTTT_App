import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Directive({
    selector: '[hasRole]',
    standalone: true,
})
export class HasRoleDirective implements OnInit {
    private requiredRoles: UserRole[] = [];

    @Input() set hasRole(roles: UserRole | UserRole[]) {
        this.requiredRoles = Array.isArray(roles) ? roles : [roles];
        this.updateView();
    }

    constructor(
        private templateRef: TemplateRef<any>,
        private vcRef: ViewContainerRef,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.updateView();
    }

    private updateView(): void {
        this.vcRef.clear();
        if (this.authService.hasRole(this.requiredRoles)) {
            this.vcRef.createEmbeddedView(this.templateRef);
        }
    }
}

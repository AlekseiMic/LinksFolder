import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './components/signin/signin.component';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtService } from './services/jwt.service';
import { SignupComponent } from './components/signup/signup.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DynamicDialogComponent } from './dialogs/DynamicDialog/dynamic.dialog.component';
import { DefaultLayoutComponent } from './components/defaultLayout/default.layout.component';
import { HeaderComponent } from './components/header/header.component';
import { AppButton } from './components/button/button.component';
import { DefaultDialogComponent } from './components/default-dialog/default-dialog.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CustomMatDialog } from '../core/CustomMatDialog';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    DynamicDialogComponent,
    DefaultLayoutComponent,
    HeaderComponent,
    AppButton,
    DefaultDialogComponent,
  ],
  imports: [
    AngularSvgIconModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatMenuModule,
    RouterModule,
  ],
  providers: [JwtService, { provide: MatDialog, useClass: CustomMatDialog }],
  exports: [SigninComponent, DefaultLayoutComponent, DefaultDialogComponent],
})
export class SharedModule {}

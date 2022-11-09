import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './components/signin/signin.component';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtService } from './services/jwt.service';
import { SignupComponent } from './components/signup/signup.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DefaultLayoutComponent } from './components/defaultLayout/default.layout.component';
import { HeaderComponent } from './components/header/header.component';
import { AppButton } from './components/button/button.component';
import { DefaultDialogComponent } from './components/default-dialog/default-dialog.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CustomMatDialog } from '../core/CustomMatDialog';
import { RouterModule } from '@angular/router';
import { FieldWrapperComponent } from './components/field-wrapper/field-wrapper.component';
import { TextfieldComponent } from './components/textfield/textfield.component';
import { FieldErrorsPipe } from './pipes/field-errors.pipe';
import { SelectComponent } from './components/select/select.component';
import { SelectDialog } from './components/select-dialog/select.dialog';

@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    DefaultLayoutComponent,
    HeaderComponent,
    AppButton,
    DefaultDialogComponent,
    FieldWrapperComponent,
    TextfieldComponent,
    FieldErrorsPipe,
    SelectComponent,
    SelectDialog,
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
  exports: [
    SelectDialog,
    SelectComponent,
    FieldWrapperComponent,
    AppButton,
    TextfieldComponent,
    SigninComponent,
    DefaultLayoutComponent,
    DefaultDialogComponent,
  ],
})
export class SharedModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FieldWrapperComponent } from './components/field-wrapper/field-wrapper.component';
import { TextfieldComponent } from './components/textfield/textfield.component';
import { FieldErrorsPipe } from './pipes/field-errors.pipe';
import { SelectComponent } from './components/select/select.component';
import { SelectDialog } from './components/select-dialog/select.dialog';
import { ButtonModule } from '../modules/button/button.module';
import { ThemeModule } from '../modules/theme/theme.module';
import { CustomDialogModule } from '../modules/dialog/dialog.module';

@NgModule({
  declarations: [
    FieldWrapperComponent,
    TextfieldComponent,
    FieldErrorsPipe,
    SelectComponent,
    SelectDialog,
  ],
  imports: [
    ButtonModule,
    AngularSvgIconModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeModule,
    CustomDialogModule,
  ],
  exports: [
    SelectDialog,
    SelectComponent,
    FieldWrapperComponent,
    TextfieldComponent,
    AngularSvgIconModule,
    CommonModule,
    ReactiveFormsModule,
    CustomDialogModule,
    ButtonModule
  ],
})
export class SharedModule {}

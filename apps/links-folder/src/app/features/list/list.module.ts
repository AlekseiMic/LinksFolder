import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonModule } from '../button/button.module';
import { LinkList } from './link-list/link-list.component';
import { Link } from './link/link.component';

@NgModule({
  imports: [
    ButtonModule,
    AngularSvgIconModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  declarations: [LinkList, Link],
  exports: [LinkList, Link],
})
export class ListModule {}

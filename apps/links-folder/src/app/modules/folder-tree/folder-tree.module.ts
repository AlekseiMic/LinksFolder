import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonModule } from '../button/button.module';
import { FolderTreeComponent } from './folder-tree.component';

@NgModule({
  imports: [CommonModule, AngularSvgIconModule, ButtonModule],
  declarations: [FolderTreeComponent],
  exports: [FolderTreeComponent],
})
export class FolderTreeModule {}

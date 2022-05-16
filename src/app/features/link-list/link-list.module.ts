import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkListIndexComponent } from './pages/link-list-index/link-list-index.component';
import { LinkRoutingModule } from './link-list-routing.module';



@NgModule({
  declarations: [
    LinkListIndexComponent
  ],
  imports: [
    CommonModule,
    LinkRoutingModule
  ]
})
export class LinkListModule { }

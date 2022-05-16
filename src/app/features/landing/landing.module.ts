import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingIndexComponent } from './pages/landing-index/landing-index.component';
import { LandingRoutingModule } from './pages/landing-routing.module';



@NgModule({
  declarations: [
    LandingIndexComponent
  ],
  imports: [
    CommonModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }

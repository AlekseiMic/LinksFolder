import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileIndexComponent } from './pages/profile-index/profile-index.component';
import { ProfileRoutingModule } from './profile-routing.module';



@NgModule({
  declarations: [
    ProfileIndexComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule { }

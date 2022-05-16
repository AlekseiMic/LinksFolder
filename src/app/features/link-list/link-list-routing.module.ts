import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkListIndexComponent } from './pages/link-list-index/link-list-index.component';

const routes: Routes = [
  {
    path: '',
    component: LinkListIndexComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkRoutingModule {}

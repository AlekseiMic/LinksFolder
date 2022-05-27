import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinksIndexPage } from './pages/links-index/links-index.page';

const routes: Routes = [
  {
    path: '',
    component: LinksIndexPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkRoutingModule {}

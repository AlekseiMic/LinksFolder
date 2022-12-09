import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexPage } from './pages/index/index.page';

const routes: Routes = [
  {
    path: ':id',
    component: IndexPage,
  },
  {
    path: '',
    component: IndexPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}

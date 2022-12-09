import { NgModule } from '@angular/core';
import { LinkFormComponent } from './components/link-form/link.form.component';
import { EditLinkForm } from './components/edit-link-form/edit-link-form.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [SharedModule],
  declarations: [LinkFormComponent, EditLinkForm],
  exports: [LinkFormComponent, EditLinkForm],
})
export class LinkFormModule {}

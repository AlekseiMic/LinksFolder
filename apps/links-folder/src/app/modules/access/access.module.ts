import { NgModule } from '@angular/core';
import { AccessCode } from './components/access-code/access-code.component';
import { AccessForm } from './components/access-form/access-form.component';
import { EditAccessForm } from './components/edit-access-form/edit-access-form.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [SharedModule],
  declarations: [AccessCode, AccessForm, EditAccessForm],
  exports: [AccessCode, AccessForm, EditAccessForm],
})
export class AccessModule {}

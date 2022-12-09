import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { CreateDirForm } from './components/create-form/create-dir-form.component';

@NgModule({
  declarations: [CreateDirForm],
  imports: [SharedModule],
  exports: [CreateDirForm],
})
export class DirectoryModule {}

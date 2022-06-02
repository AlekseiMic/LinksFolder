import { CdkDropList } from '@angular/cdk/drag-drop';
import { Directive } from '@angular/core';
import { Subscription } from 'rxjs';
import { DragNDropManagerService } from '../services/drag-n-drop-manager.service';

@Directive({
  selector: '[appDragNDropManager]',
})
export class DragNDropManagerDirective {
  private manager!: Subscription;

  constructor(
    private dropList: CdkDropList,
    private managerService: DragNDropManagerService
  ) {}

  ngOnInit(): void {
    this.managerService.register(this.dropList.id);
    this.manager = this.managerService.onListChange().subscribe((x) => {
      this.dropList.connectedTo = x;
    });
  }

  ngOnDestroy(): void {
    // this.manager.unsubscribe();
    if (this.manager) this.manager.unsubscribe();
  }
}


@Directive({
  selector: '[appDragNDropManagerRoot]',
  providers: [
    {
      provide: DragNDropManagerService
    }
  ]
})
export class DragNDropManagerRootDirective {
}

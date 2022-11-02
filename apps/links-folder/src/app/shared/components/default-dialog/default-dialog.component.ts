import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-default-dialog',
  templateUrl: './default-dialog.component.html',
  styleUrls: ['./default-dialog.component.scss'],
})
export class DefaultDialogComponent {
  @Input() title: false | string = 'Title';
}

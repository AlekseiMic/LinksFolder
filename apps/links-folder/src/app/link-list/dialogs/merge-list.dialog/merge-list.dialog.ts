import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'merge-list-dialog',
  templateUrl: 'merge-list.dialog.html',
})
export class MergeListDialog {
  onAccept = new EventEmitter();
  onDecline = new EventEmitter();
}

import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'merge-guest-list-dialog',
  templateUrl: 'merge-guest-list.dialog.html',
})
export class MergeGuestListDialog {
  onAccept = new EventEmitter();
  onDecline = new EventEmitter();
}

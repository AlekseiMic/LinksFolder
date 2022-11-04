import { Component, OnInit } from '@angular/core';

@Component({
  selector: '[btn]',
  template: '<ng-content></ng-content>',
  styleUrls: ['./button.component.scss'],
})
export class AppButton implements OnInit {
  ngOnInit(): void {}
}

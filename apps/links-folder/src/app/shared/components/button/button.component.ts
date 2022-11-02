import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: '[btn]',
  template: '<ng-content></ng-content>',
  styleUrls: ['./button.component.scss'],
})
export class AppButton implements OnInit {
  @Input('full') full: any = true;

  ngOnInit(): void {}
}

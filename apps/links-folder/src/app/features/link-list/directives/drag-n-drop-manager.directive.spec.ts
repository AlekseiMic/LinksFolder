import { CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DragNDropManagerService } from '../services/drag-n-drop-manager.service';
import { DragNDropManagerDirective } from './drag-n-drop-manager.directive';

@Component({
  selector: 'test-compo',
  template: '',
})
class TestComponent {}

describe('DragNDropManagerDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DragDropModule
      ],
      providers: [
        DragNDropManagerService,
        CdkDropList
      ],
      declarations: [
        DragNDropManagerDirective,
        TestComponent
      ],
    }).compileComponents();
  });

  it('should create an instance', () => {
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: '<div appDragNDropManager></div>'
      }
    });
    const fixture = TestBed.createComponent(TestComponent);
    const directiveEL = fixture.debugElement.query(By.directive(DragNDropManagerDirective));
    expect(directiveEL).not.toBeNull();
  });
});

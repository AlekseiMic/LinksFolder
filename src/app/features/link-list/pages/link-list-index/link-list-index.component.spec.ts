import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkListIndexComponent } from './link-list-index.component';

describe('LinkListIndexComponent', () => {
  let component: LinkListIndexComponent;
  let fixture: ComponentFixture<LinkListIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkListIndexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkListIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

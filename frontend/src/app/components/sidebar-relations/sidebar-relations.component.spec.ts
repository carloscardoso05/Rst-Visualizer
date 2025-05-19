import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarRelationsComponent } from './sidebar-relations.component';

describe('SidebarRelationsComponent', () => {
  let component: SidebarRelationsComponent;
  let fixture: ComponentFixture<SidebarRelationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarRelationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarRelationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

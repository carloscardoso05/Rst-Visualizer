import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarDocumentsComponent } from './sidebar-documents.component';

describe('SidebarDocumentsComponent', () => {
  let component: SidebarDocumentsComponent;
  let fixture: ComponentFixture<SidebarDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

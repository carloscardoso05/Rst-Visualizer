import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsInfoComponent } from './documents-info.component';

describe('DocumentsInfoComponent', () => {
  let component: DocumentsInfoComponent;
  let fixture: ComponentFixture<DocumentsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

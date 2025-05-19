import { Component, computed, inject, input, signal } from '@angular/core';
import { DocumentsNameAndCodeQuery } from '../../../generated/graphql';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-sidebar-documents',
  imports: [FormsModule, RouterModule],
  templateUrl: './sidebar-documents.component.html',
  styleUrl: './sidebar-documents.component.css',
})
export class SidebarDocumentsComponent {
  readonly documents = input.required<DocumentsNameAndCodeQuery['documents']>();
  readonly search = signal('');
  readonly filteredDocuments = computed(() => {
    const search = this.search().toLowerCase();
    return this.documents().filter((document) =>
      document.name.toLowerCase().includes(search)
    );
  });
}

import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DocumentsNameAndCodeQuery } from '../../../generated/graphql';

@Component({
  selector: 'app-sidebar-documents',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './sidebar-documents.component.html',
  styleUrl: './sidebar-documents.component.css',
})
export class SidebarDocumentsComponent {
  readonly documents = input.required<DocumentsNameAndCodeQuery['documents']>();
  readonly search = signal('');
  readonly currentDocumentId = signal<number | null>(null);

  readonly filteredDocuments = computed(() => {
    const search = this.search().toLowerCase();
    return this.documents().filter((document) =>
      document.name.toLowerCase().includes(search)
    );
  });

}

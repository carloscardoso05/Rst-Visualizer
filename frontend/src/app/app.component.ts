import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  DocumentsNameAndCodeGQL,
  DocumentsNameAndCodeQuery,
} from '../generated/graphql';
import { SidebarDocumentsComponent } from './components/sidebar-documents/sidebar-documents.component';
import { SidebarRelationsComponent } from './components/sidebar-relations/sidebar-relations.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarDocumentsComponent, SidebarRelationsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'frontend';

  private readonly documentsGQL = inject(DocumentsNameAndCodeGQL);
  readonly documents = signal<DocumentsNameAndCodeQuery['documents']>([]);
  readonly loading = signal(false);
  readonly error = signal<Error | null>(null);

  loadDocuments() {
    this.loading.set(true);
    this.documentsGQL.fetch().subscribe({
      next: (result) => {
        this.documents.set(result.data.documents);
        this.error.set(null);
      },
      error: (error) => {
        this.error.set(error);
        this.documents.set([]);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  ngOnInit(): void {
    this.loadDocuments();
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import {
  DocumentsNameTextGQL,
  DocumentsNameTextQuery,
} from '../../../generated/graphql';
import { TruncatePipe } from '../../pipes/truncate/truncate.pipe';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [TruncatePipe, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private readonly documentsGQL = inject(DocumentsNameTextGQL);
  readonly documents = signal<DocumentsNameTextQuery['documents']>([]);
  readonly loading = signal(false);
  readonly error = signal<Error | null>(null);
  private readonly router = inject(Router);

  loadDocuments() {
    this.loading.set(true);
    this.documentsGQL.fetch().subscribe({
      next: (result) => {
        console.log('Result:', result);
        this.documents.set(result.data.documents);
        this.error.set(null);
      },
      error: (error) => {
        this.error.set(error);
        this.documents.set([]);
      },
      complete: () => {
        console.log('Completed');
        this.loading.set(false);
      },
    });
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  goToDocumentPage(id: number): void {
    this.router.navigate(['documents', id]);
  }
}

import { Component, inject, OnInit, signal, viewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DocumentPageQueryGQL,
  DocumentPageQueryQuery,
} from '../../../generated/graphql';

@Component({
  selector: 'app-document-page',
  imports: [],
  templateUrl: './document-page.component.html',
  styleUrl: './document-page.component.css',
})
export class DocumentPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly query = inject(DocumentPageQueryGQL);

  readonly document = signal<
    DocumentPageQueryQuery['documents'][number] | null
  >(null);
  readonly loading = signal(false);
  readonly error = signal<Error | null>(null);
  readonly tokensElements = viewChildren('token')

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = parseInt(params.get('id') ?? '', 10);
      if (!id) {
        throw new Error('File name is required');
      }
      this.loading.set(true);
      this.query.fetch({ id: id }).subscribe({
        next: (result) => {
          if (result.data.documents.length !== 1) {
            const error = new Error(
              `Only one document is expected, but got ${result.data.documents.length
              }\n${JSON.stringify(result.data.documents)}`
            );
            this.document.set(null);
            this.error.set(
              new Error('Nenhum documento encontrado com este nome')
            );
            throw error;
          }
          this.document.set(result.data.documents[0] ?? null);
          this.error.set(null);


        },
        error: (error) => {
          this.document.set(null);
          this.error.set(error);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
    });
  }
}

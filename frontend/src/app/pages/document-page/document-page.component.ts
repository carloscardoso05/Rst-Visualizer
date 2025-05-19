import { AfterRenderRef, AfterViewInit, Component, effect, ElementRef, inject, OnInit, signal, viewChild, viewChildren } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  DocumentPageQueryGQL,
  DocumentPageQueryQuery,
} from '../../../generated/graphql';
import { SafeHtmlPipe } from '../../safe-html/safe-html.pipe';

@Component({
  selector: 'app-document-page',
  imports: [RouterModule, SafeHtmlPipe],
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

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = parseInt(params.get('id') ?? '', 10);
      if (!id) {
        throw new Error('File Id is required');
      }
      this.loadDocument(id);
    });
  }

  private loadDocument(id: number) {
    this.loading.set(true);
    this.query.fetch({ id: id }, { fetchPolicy: 'network-only' }).subscribe({
      next: (result) => {
        if (result.data.documents.length !== 1) {
          const error = new Error(
            `Only one document is expected, but got ${result.data.documents.length}
            \n${JSON.stringify(result.data.documents)}`
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
  }

  // Add this method to your component class
  isTokenInRelation(tokenId: string | number, relation: any): boolean {
    if (!relation.tokensIds || !Array.isArray(relation.tokensIds)) {
      return false;
    }

    return relation.tokensIds.some((t: any) => t.id === tokenId);
  }

  scrollToRelation(relation: DocumentPageQueryQuery['documents'][number]['intraSententialRelations'][number]): void {

    // Remove any existing highlights
    document.querySelectorAll('.token-highlight').forEach(el => {
      el.classList.remove('token-highlight');
    });
    document.querySelectorAll('.parent-token-highlight').forEach(el => {
      el.classList.remove('parent-token-highlight');
    });

    const innerTokensIds = relation.tokensIds ?? [];
    const parentTokensIds = relation.parent?.tokensIds ?? [];

    const tabs = document.querySelectorAll('input[name="document-tabs"]');
    if (tabs.length > 0) {
      (tabs[0] as HTMLInputElement).checked = true;
    }

    if (!innerTokensIds.length) return;

    const firstToken = document.getElementById(`token-${innerTokensIds[0]?.id}`);

    if (firstToken) {
      firstToken.scrollIntoView({ behavior: 'smooth', block: 'center' });

      parentTokensIds.forEach((token) => {
        const element = document.getElementById(`token-${token.id}`);
        if (element) {
          element.classList.add('parent-token-highlight');
        }
      });

      innerTokensIds.forEach((token) => {
        const element = document.getElementById(`token-${token.id}`);
        if (element) {
          element.classList.add('token-highlight');
        }
      });
    }
  }
}
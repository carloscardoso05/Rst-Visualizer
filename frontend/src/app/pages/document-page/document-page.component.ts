import { AfterRenderRef, AfterViewInit, Component, effect, ElementRef, inject, OnDestroy, OnInit, signal, viewChild, viewChildren } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  DocumentPageQueryGQL,
  DocumentPageQueryQuery,
} from '../../../generated/graphql';
import { SafeHtmlPipe } from '../../safe-html/safe-html.pipe';
import { RstTreeVisualizationComponent } from '../../components/rst-tree-visualization/rst-tree-visualization.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document-page',
  standalone: true,
  imports: [RouterModule, SafeHtmlPipe, RstTreeVisualizationComponent],
  templateUrl: './document-page.component.html',
  styleUrl: './document-page.component.css',
})
export class DocumentPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly query = inject(DocumentPageQueryGQL);
  private subscriptions: Subscription[] = [];

  readonly document = signal<
    DocumentPageQueryQuery['documents'][number] | null
  >(null);
  readonly loading = signal(false);
  readonly error = signal<Error | null>(null);
  readonly highlightedRelationId = signal<number | null>(null);

  ngOnInit(): void {
    const paramsSub = this.route.paramMap.subscribe(params => {
      const id = parseInt(params.get('id') ?? '', 10);
      if (!id) {
        throw new Error('File Id is required');
      }
      this.loadDocument(id);
    });
    
    // Handle query params separately to ensure we don't reload document unnecessarily
    const querySub = this.route.queryParams.subscribe(queryParams => {
      const relationId = queryParams['relationId'];
      if (relationId) {
        this.highlightedRelationId.set(parseInt(relationId, 10));
        this.tryHighlightRelation();
      } else {
        this.highlightedRelationId.set(null);
      }
    });
    
    this.subscriptions.push(paramsSub, querySub);
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
        
        // Try to highlight relation after document is loaded
        this.tryHighlightRelation();
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
  
  private tryHighlightRelation(): void {
    if (!this.document() || !this.highlightedRelationId()) return;
    
    // Find the relation by ID
    const relationId = this.highlightedRelationId();
    const relation = this.document()?.intraSententialRelations.find(
      r => r.id === relationId
    );
    
    if (relation) {
      // Use a longer timeout to ensure DOM is fully rendered
      setTimeout(() => {
        this.scrollToRelation(relation);
      }, 500);
    } else {
      console.warn(`Relation with ID ${relationId} not found in document`);
    }
  }

  // Add this method to your component class
  isTokenInRelation(tokenId: string | number, relation: any): boolean {
    if (!relation.tokensIds || !Array.isArray(relation.tokensIds)) {
      return false;
    }

    return relation.tokensIds.some((t: any) => t.id === tokenId);
  }

  scrollToRelation(relation: DocumentPageQueryQuery['documents'][number]['intraSententialRelations'][number]): void {
    // Log relation data for debugging
    console.log('Scrolling to relation:', relation);
    console.log('Tokens:', relation.tokensIds);
    
    // Remove any existing highlights
    document.querySelectorAll('.token-highlight').forEach(el => {
      el.classList.remove('token-highlight');
    });
    document.querySelectorAll('.parent-token-highlight').forEach(el => {
      el.classList.remove('parent-token-highlight');
    });

    const innerTokensIds = relation.tokensIds ?? [];
    const parentTokensIds = relation.parent?.tokensIds ?? [];

    // Select the first tab (text tab)
    const tabs = document.querySelectorAll('input[name="document-tabs"]');
    if (tabs.length > 0) {
      (tabs[0] as HTMLInputElement).checked = true;
    }

    // Check if there are any tokens to highlight
    if (!innerTokensIds.length) {
      console.warn('No tokens to highlight for relation:', relation.id);
      
      // Still expand the relation card even if no tokens to highlight
      this.expandRelationCard(relation.id);
      return;
    }

    // Also expand the relation in the relations list
    this.expandRelationCard(relation.id);

    // Try to find the first token
    const firstToken = document.getElementById(`token-${innerTokensIds[0]?.id}`);

    if (firstToken) {
      // Scroll to the token with smooth behavior
      firstToken.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight parent tokens
      let parentHighlighted = 0;
      parentTokensIds.forEach((token) => {
        const element = document.getElementById(`token-${token.id}`);
        if (element) {
          element.classList.add('parent-token-highlight');
          parentHighlighted++;
        }
      });
      
      // Highlight relation tokens
      let tokensHighlighted = 0;
      innerTokensIds.forEach((token) => {
        const element = document.getElementById(`token-${token.id}`);
        if (element) {
          element.classList.add('token-highlight');
          tokensHighlighted++;
        }
      });
      
      // Log highlight success statistics
      console.log(`Highlighted ${tokensHighlighted}/${innerTokensIds.length} relation tokens and ${parentHighlighted}/${parentTokensIds.length} parent tokens`);
    } else {
      console.warn('First token element not found in DOM:', innerTokensIds[0]?.id);
      
      // Try an alternative approach - look for tokens by iterating through all spans
      this.highlightTokensByContent(relation);
    }
  }

  // New method to try highlighting by content matching when IDs fail
  private highlightTokensByContent(relation: DocumentPageQueryQuery['documents'][number]['intraSententialRelations'][number]): void {
    const relationText = relation.text;
    if (!relationText) return;
    
    console.log('Trying to highlight by text content:', relationText);
    
    // Get all token spans
    const tokenSpans = document.querySelectorAll('[id^="token-"]');
    
    // Try to find the relation text in the document
    let textFound = false;
    let currentMatch = '';
    let matchingElements: HTMLElement[] = [];
    
    tokenSpans.forEach((span) => {
      const content = span.textContent?.trim() || '';
      
      if (currentMatch.length === 0) {
        // Start a new potential match
        if (relationText.includes(content)) {
          currentMatch = content;
          matchingElements = [span as HTMLElement];
        }
      } else {
        // Continue building the match
        const newMatch = `${currentMatch} ${content}`.trim();
        if (relationText.includes(newMatch)) {
          currentMatch = newMatch;
          matchingElements.push(span as HTMLElement);
          
          // Check if we've found the complete text
          if (newMatch === relationText.trim()) {
            textFound = true;
            
            // Highlight all matching elements
            matchingElements.forEach(el => {
              el.classList.add('token-highlight');
            });
            
            // Scroll to the first matching element
            if (matchingElements.length > 0) {
              matchingElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            console.log(`Successfully highlighted relation by text content with ${matchingElements.length} tokens`);
          }
        } else {
          // Reset if the match fails
          currentMatch = '';
          matchingElements = [];
        }
      }
    });
    
    if (!textFound) {
      console.warn('Could not highlight relation by content matching either:', relationText);
    }
  }
  
  // Helper to expand the relation card in the relations list
  private expandRelationCard(relationId: number): void {
    setTimeout(() => {
      const relationCards = document.querySelectorAll('.collapse');
      
      relationCards.forEach((card, index) => {
        if (index === this.document()?.intraSententialRelations.findIndex(r => r.id === relationId)) {
          const checkbox = card.querySelector('input[type="checkbox"]') as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = true;
          }
        }
      });
    }, 100);
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { RelationsDataGQL } from '../../../generated/graphql';
import { SidebarRelationsComponent } from '../../components/sidebar-relations/sidebar-relations.component';

// Import the RelationItem interface
interface RelationItem {
  documentId: number;
  documentName: string;
  relationId: number;
  relationName: string;
  relationText: string;
  signalType: string;
  signalSubtype: string;
  signalText: string;
}

@Component({
  selector: 'app-relations-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './relations-page.component.html',
  styleUrl: './relations-page.component.css'
})
export class RelationsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly relationsQuery = inject(RelationsDataGQL);

  readonly loading = signal(false);
  readonly error = signal<Error | null>(null);
  readonly filters = signal<RelationItem[]>([]);
  readonly loaded = signal(false);

  readonly type = signal<string | null>(null);
  readonly subtype = signal<string | null>(null);
  readonly relationName = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.type.set(params.get('type'));
      this.subtype.set(params.get('subtype'));
      this.relationName.set(params.get('relation'));
      this.loadRelations();
    });
  }

  loadRelations(): void {
    this.loading.set(true);
    
    // If SidebarRelationsComponent has already loaded the data, use it
    if (SidebarRelationsComponent.relationsData) {
      this.filterRelations(SidebarRelationsComponent.relationsData.relations);
      this.loaded.set(true);
      this.loading.set(false);
    } else {
      // Otherwise, load the data directly
      this.relationsQuery.fetch().subscribe({
        next: (result) => {
          const relations: RelationItem[] = [];
          
          result.data.documents.forEach(doc => {
            doc.intraSententialRelations.forEach(relation => {
              if (!relation.relation) return;
              
              if (relation.signals.length > 0) {
                relation.signals.forEach(signal => {
                  relations.push({
                    documentId: doc.id,
                    documentName: doc.name,
                    relationId: relation.id,
                    relationName: relation.relation?.name || 'Unknown',
                    relationText: relation.text,
                    signalType: signal.type,
                    signalSubtype: signal.subtype || 'Sem sinalizador',
                    signalText: signal.text
                  });
                });
              } else {
                relations.push({
                  documentId: doc.id,
                  documentName: doc.name,
                  relationId: relation.id,
                  relationName: relation.relation?.name || 'Unknown',
                  relationText: relation.text,
                  signalType: 'Sem sinalizador',
                  signalSubtype: 'Sem sinalizador',
                  signalText: ''
                });
              }
            });
          });
          
          this.filterRelations(relations);
        },
        complete: () => {
          this.loaded.set(true);
          this.loading.set(false);
        }
      });
    }
  }

  private filterRelations(relations: RelationItem[]): void {
    let filtered = relations;
    
    if (this.type()) {
      filtered = filtered.filter(r => r.signalType === this.type());
    }
    
    if (this.subtype()) {
      filtered = filtered.filter(r => r.signalSubtype === this.subtype());
    }
    
    if (this.relationName()) {
      filtered = filtered.filter(r => r.relationName === this.relationName());
    }
    
    this.filters.set(filtered);
  }

  navigateToDocument(item: RelationItem): void {
    // Use Angular Router instead of direct window.location
    this.router.navigate(['/documents', item.documentId], {
      queryParams: { relationId: item.relationId }
    });
  }
}

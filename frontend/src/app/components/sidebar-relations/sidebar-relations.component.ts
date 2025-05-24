import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RelationsDataGQL } from '../../../generated/graphql';

// Define interfaces for our data structures
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

interface RelationCountItem {
  relationName: string;
  count: number;
}

@Component({
  selector: 'app-sidebar-relations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar-relations.component.html',
  styleUrl: './sidebar-relations.component.css'
})
export class SidebarRelationsComponent implements OnInit {
  private readonly relationsQuery = inject(RelationsDataGQL);

  readonly loading = signal(false);
  readonly error = signal<Error | null>(null);
  readonly relations = signal<RelationItem[]>([]);

  // Static property to share data with other components
  static relationsData: { relations: RelationItem[] } | null = null;

  ngOnInit(): void {
    this.loadRelations();
  }

  loadRelations(): void {
    this.loading.set(true);
    
    // If data already loaded, use it
    if (SidebarRelationsComponent.relationsData) {
      this.relations.set(SidebarRelationsComponent.relationsData.relations);
      this.loading.set(false);
      return;
    }
    
    this.relationsQuery.fetch().subscribe({
      next: ({ data }) => {
        const relationsItems: RelationItem[] = [];
        
        data.documents.forEach(doc => {
          doc.intraSententialRelations.forEach(relation => {
            if (!relation.relation) return;
            
            if (relation.signals && relation.signals.length > 0) {
              relation.signals.forEach(signal => {
                relationsItems.push({
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
              relationsItems.push({
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
        
        this.relations.set(relationsItems);
        SidebarRelationsComponent.relationsData = { relations: relationsItems };
      },
      error: (err) => {
        this.error.set(err);
        this.relations.set([]);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  // Gets all the unique signal types from relations
  getFilteredTypes(): string[] {
    const types = new Set<string>();
    this.relations().forEach(item => {
      types.add(item.signalType);
    });
    return Array.from(types).sort().filter(type => type.toUpperCase() !== 'CDP');
  }

  // Gets all the unique subtypes for a specific signal type
  getFilteredSubtypes(type: string): string[] {
    const subtypes = new Set<string>();
    this.relations().forEach(item => {
      if (item.signalType === type) {
        subtypes.add(item.signalSubtype);
      }
    });
    return Array.from(subtypes).sort().filter(subtype => subtype.toUpperCase() !== 'CDP');
  }

  // Gets counts of relation names for a specific type and subtype
  getRelationCounts(type: string, subtype: string): RelationCountItem[] {
    const relationCounts = new Map<string, number>();
    
    this.relations().forEach(item => {
      if (item.signalType === type && item.signalSubtype === subtype) {
        const count = relationCounts.get(item.relationName) || 0;
        relationCounts.set(item.relationName, count + 1);
      }
    });
    
    return Array.from(relationCounts.entries())
      .map(([relationName, count]) => ({ relationName, count }))
      .sort((a, b) => b.count - a.count);
  }

  navigateToRelation(item: RelationItem): void {
    window.location.href = `/documents/${item.documentId}?relationId=${item.relationId}`;
  }
}

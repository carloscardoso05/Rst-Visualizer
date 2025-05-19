import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RelationsDataGQL } from '../../../generated/graphql';
import { signal } from '@angular/core';

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

interface RelationCount {
  relationName: string;
  count: number;
  items: RelationItem[];
}

// Add this interface if it doesn't already exist
interface RelationsData {
  relations: RelationItem[];
  relationsBySignal: Map<string, RelationItem[]>;
  relationCountsBySignal: Map<string, RelationCount[]>;
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
  readonly search = signal('');
  readonly relations = signal<RelationItem[]>([]);

  // Hierarchical structure for the UI
  readonly signalTypes = signal<Map<string, Set<string>>>(new Map());
  readonly relationsBySignal = signal<Map<string, RelationItem[]>>(new Map());
  readonly relationCountsBySignal = signal<Map<string, RelationCount[]>>(new Map());

  // Make relations data available as a static property so relations page can access it
  static relationsData: RelationsData | null = null;

  ngOnInit(): void {
    this.loadRelations();
  }

  loadRelations(): void {
    this.loading.set(true);
    this.relationsQuery.fetch().subscribe({
      next: (result) => {
        const relationsData: RelationItem[] = [];
        const types = new Map<string, Set<string>>();
        const relationsBySignal = new Map<string, RelationItem[]>();
        const relationCountsBySignal = new Map<string, RelationCount[]>();

        // Process the data to build our hierarchical structure
        result.data.documents.forEach(doc => {
          doc.intraSententialRelations.forEach(relation => {
            if (!relation.relation) return;

            // If there are signals, organize by them
            if (relation.signals.length > 0) {
              relation.signals.forEach(signal => {
                // Create the item
                const item: RelationItem = {
                  documentId: doc.id,
                  documentName: doc.name,
                  relationId: relation.id,
                  relationName: relation.relation?.name || 'Unknown',
                  relationText: relation.text,
                  signalType: signal.type,
                  signalSubtype: signal.subtype || 'None',
                  signalText: signal.text
                };

                relationsData.push(item);

                // Build the hierarchy
                if (!types.has(signal.type)) {
                  types.set(signal.type, new Set());
                }
                types.get(signal.type)?.add(signal.subtype || 'None');

                const key = `${signal.type}:${signal.subtype || 'None'}`;
                if (!relationsBySignal.has(key)) {
                  relationsBySignal.set(key, []);
                  relationCountsBySignal.set(key, []);
                }
                relationsBySignal.get(key)?.push(item);
                
                // Update relation counts
                this.updateRelationCounts(relationCountsBySignal, key, item);
              });
            } else {
              // No signals, add to a "No Signal" category
              const item: RelationItem = {
                documentId: doc.id,
                documentName: doc.name,
                relationId: relation.id,
                relationName: relation.relation?.name || 'Unknown',
                relationText: relation.text,
                signalType: 'No Signal',
                signalSubtype: 'None',
                signalText: ''
              };

              relationsData.push(item);

              if (!types.has('No Signal')) {
                types.set('No Signal', new Set(['None']));
              }

              const key = 'No Signal:None';
              if (!relationsBySignal.has(key)) {
                relationsBySignal.set(key, []);
                relationCountsBySignal.set(key, []);
              }
              relationsBySignal.get(key)?.push(item);
              
              // Update relation counts for no signal items
              this.updateRelationCounts(relationCountsBySignal, key, item);
            }
          });
        });

        this.relations.set(relationsData);
        this.signalTypes.set(types);
        this.relationsBySignal.set(relationsBySignal);
        this.relationCountsBySignal.set(relationCountsBySignal);

        // Store data statically for access by other components
        SidebarRelationsComponent.relationsData = {
          relations: relationsData,
          relationsBySignal: relationsBySignal,
          relationCountsBySignal: relationCountsBySignal
        };
        
        this.error.set(null);
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

  // Helper method to update relation counts
  private updateRelationCounts(
    countMap: Map<string, RelationCount[]>, 
    key: string, 
    item: RelationItem
  ): void {
    const counts = countMap.get(key) || [];
    const existingCount = counts.find(c => c.relationName === item.relationName);
    
    if (existingCount) {
      existingCount.count++;
      existingCount.items.push(item);
    } else {
      counts.push({
        relationName: item.relationName,
        count: 1,
        items: [item]
      });
    }
    
    countMap.set(key, counts);
  }

  navigateToRelation(item: RelationItem): void {
    window.location.href = `/documents/${item.documentId}?relationId=${item.relationId}`;
  }

  getFilteredTypes(): string[] {
    return Array.from(this.signalTypes().keys());
  }

  getFilteredSubtypes(type: string): string[] {
    const subtypes = this.signalTypes().get(type) || new Set();
    return Array.from(subtypes);
  }

  getFilteredRelations(type: string, subtype: string): RelationItem[] {
    const key = `${type}:${subtype}`;
    const relations = this.relationsBySignal().get(key) || [];
    return relations;
  }

  // New method to get relation counts
  getRelationCounts(type: string, subtype: string): RelationCount[] {
    const key = `${type}:${subtype}`;
    const counts = this.relationCountsBySignal().get(key) || [];
    return counts;
  }
}

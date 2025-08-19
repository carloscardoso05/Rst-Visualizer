import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, XIcon } from 'lucide-angular';
import {
  DocumentsInfoGQL,
  DocumentsInfoQuery,
  RelationsBySignalsGQL,
} from '../../../../graphql/generated';

@Component({
  selector: 'app-documents-info',
  imports: [
    FormsModule,
    RouterLink,
    FormsModule,
    ScrollingModule,
    LucideAngularModule,
  ],
  templateUrl: './documents-info.component.html',
  styleUrl: './documents-info.component.css',
})
export class DocumentsInfoComponent {
  readonly XIcon = XIcon;

  showDocumentosTab = signal(true);

  maxItems = signal(50);

  loadMore() {
    this.maxItems.update((max) => max + 50);
  }

  documentsQuery = inject(DocumentsInfoGQL);
  documentsResult = toSignal(
    this.documentsQuery.fetch({ limitWords: 50 }, { fetchPolicy: 'no-cache' }),
  );

  search = signal('');
  searchedDocuments = computed<DocumentsInfoQuery['rst']>(() => {
    const documents = this.documentsResult()?.data.rst ?? [];
    if (!this.search()) return documents;
    return documents.filter((doc) =>
      doc.name.toUpperCase().includes(this.search().toUpperCase()),
    );
  });

  relationsQuery = inject(RelationsBySignalsGQL);
  relationsResult = toSignal(
    this.relationsQuery.fetch(undefined, { fetchPolicy: 'no-cache' }),
  );

  relations = computed<RelationsData>(() => {
    const relations: RelationsData = [];

    if (this.relationsResult() === undefined) return relations;

    this.relationsResult()!.data.rst.forEach((document) => {
      const nodes = [...document.groups, ...document.segments];
      relations.push(
        ...nodes.map<RelationsData[number]>((node) => {
          return {
            id: node.id,
            documentId: document.id,
            document: document.name,
            relationName: node.relation!.name,
            text: node.tokensById
              .sort((a, b) => a.id - b.id)
              .map((tokenId) => tokenId.token)
              .join(' '),
            signals: node.signals.map((signal) => ({
              type: signal.type,
              subtype: signal.subtype,
              tokens: node.tokensById
                .filter((tokenId) => signal.tokensIndexes.includes(tokenId.id))
                .sort((a, b) => a.id - b.id)
                .map((tokenId) => tokenId.token),
            })),
          };
        }),
      );
    });

    return relations.filter((node) => {
      return (
        (!this.search() ||
          node.document.toUpperCase().includes(this.search().toUpperCase())) &&
        (!this.signalType() ||
          node.signals
            .map((signal) => signal.type)
            .includes(this.signalType())) &&
        (!this.signalSubtype() ||
          node.signals
            .map((signal) => signal.subtype)
            .includes(this.signalSubtype()))
      );
    });
  });

  signalType = signal('');
  signalSubtype = signal('');

  clearType() {
    this.signalType.set('');
    this.clearSubtype();
  }

  clearSubtype() {
    this.signalSubtype.set('');
  }

  typesAndSubtypes = computed<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();

    this.relations().forEach((node) => {
      node.signals.forEach((signal) => {
        if (!map.has(signal.type)) {
          map.set(signal.type, new Set<string>());
        }
        map.get(signal.type)!.add(signal.subtype);
      });
    });

    return map;
  });

  types = computed(() => [...this.typesAndSubtypes().keys()]);
  subtypes = computed(() => [
    ...(this.typesAndSubtypes().get(this.signalType()) ?? []),
  ]);
}

type RelationsData = Array<{
  id: number;
  documentId: number;
  document: string;
  text: string;
  relationName: string;
  signals: Array<{
    type: string;
    subtype: string;
    tokens: string[];
  }>;
}>;

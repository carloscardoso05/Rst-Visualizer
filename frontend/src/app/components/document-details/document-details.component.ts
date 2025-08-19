import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  AfterViewChecked,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DocumentDetailsGQL,
  DocumentDetailsQuery,
} from '../../../../graphql/generated';
import { singleWhere } from '../../../util';
import { NodeComponent, NodeData } from '../node/node.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-document-details',
  imports: [NodeComponent, RouterLink, ScrollingModule],
  templateUrl: './document-details.component.html',
  styleUrl: './document-details.component.css',
})
export class DocumentDetailsComponent {
  documentId = input<number, string | undefined>(undefined, {
    transform: (value) => (value ? Number(value) : undefined),
  });
  relationId = input<number, string | undefined>(undefined, {
    transform: (value) => (value ? Number(value) : undefined),
  });

  highLightRelation = effect(() => {
    const relationId = this.relationId();
    const rstData = this.rstData();
    const tabTextoAnotado = this.tabTextoAnotado();

    if (relationId !== undefined && rstData && tabTextoAnotado) {
      this.selectRelationDetails(relationId);
    }
  });

  query = inject(DocumentDetailsGQL);

  fetchData = effect(() => {
    if (this.documentId() === undefined) return;
    this.query
      .fetch({ documentId: this.documentId() }, { fetchPolicy: 'no-cache' })
      .subscribe({
        next: (result) => this.rstData.set(result.data.rst[0]),
        error: (e) => console.error('Erro ao carregar dados', e),
      });
  });

  rstData = signal<undefined | DocumentDetailsQuery['rst'][number]>(undefined);

  selectedNode = signal<number | undefined>(undefined);
  tabTextoAnotado = viewChild<ElementRef<HTMLInputElement>>('tabTextoAnotado');
  tabTextoOriginal =
    viewChild<ElementRef<HTMLInputElement>>('tabTextoOriginal');

  processedData = computed(() => {
    const rstData = this.rstData();
    if (!rstData) {
      return {
        nodesMap: new Map(),
        relations: [],
        root: undefined,
      };
    }

    const allNodes = [...(rstData.groups ?? []), ...(rstData.segments ?? [])];
    const nodesMap = new Map<number, (typeof allNodes)[number]>();
    allNodes.forEach((node) => nodesMap.set(node.id, node));

    const nodesData = allNodes.map<NodeData>((node) => ({
      id: node.id,
      parentId: node.parentId ?? undefined,
      order: node.order,
      tokensById: node.__typename === 'Segment' ? node.tokensById : [],
      children: [],
    }));
    const nodesDataById = new Map<number, NodeData>();
    nodesData.forEach((data) => nodesDataById.set(data.id, data));
    nodesData.forEach((node) => {
      if (node.parentId !== undefined) {
        nodesDataById.get(node.parentId)?.children.push(node);
      }
    });
    nodesData.forEach((data) =>
      data.children.sort((a, b) => a.order - b.order),
    );
    const root = singleWhere(nodesData, (data) => data.parentId === undefined);

    // 3. Calculate relations (from your 'relations' computed)
    const nodesIdsWithRelations = new Set(
      rstData.nodesIdsWithIntraSententialRelations,
    );
    const relations = [...nodesMap.values()]
      .filter((node) => nodesIdsWithRelations.has(node.id) && node.relation)
      .map((node) => {
        const parentTokens = node.parentId
          ? nodesMap.get(node.parentId)!.tokensById
          : [];
        return {
          nodeId: node.id,
          text: node.tokensById.map((obj) => obj.token).join(' '),
          name: node.relation!.name,
          type: node.relation!.type,
          parentText: parentTokens.map((obj) => obj.token).join(' '),
          signals: node.signals.map((signal) => ({
            ...signal,
            tokens: node.tokensById
              .filter((tokenId) => signal.tokensIndexes.includes(tokenId.id))
              .sort((a, b) => a.id - b.id)
              .map((tokenId) => tokenId.token),
          })),
        };
      });

    return { nodesMap, relations, root };
  });

  nodes = computed(() => this.processedData().nodesMap);
  relations = computed(() => this.processedData().relations);
  root = computed(() => this.processedData().root);

  location = inject(Location);

  selectRelationOnText(nodeId: number) {
    this.tabTextoOriginal()!.nativeElement.checked = false;
    this.tabTextoAnotado()!.nativeElement.checked = true;
    this.selectedNode.set(nodeId);
    window.history.replaceState(
      null,
      '',
      `documents/${this.documentId()}/relations/${nodeId}`,
    );
    setTimeout(() => {
      document
        .getElementById(`node-${nodeId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  selectRelationDetails(nodeId: number) {
    this.selectedNode.set(nodeId);
    setTimeout(() => {
      const element = document.getElementById(`relation-${nodeId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.click()
    }, 0);
  }
}

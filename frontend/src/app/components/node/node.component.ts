import { Component, computed, effect, input, OnInit } from '@angular/core';
import { DocumentDetailsQuery } from '../../../../graphql/generated';

export type NodeData = {
  id: number;
  parentId?: number;
  order: number;
  tokensById: DocumentDetailsQuery['rst'][number]['segments'][number]['tokensById'];
  children: NodeData[];
};

@Component({
  selector: 'app-node',
  imports: [],
  templateUrl: './node.component.html',
  styleUrl: './node.component.css',
})
export class NodeComponent {
  nodeData = input.required<NodeData>();
  selectedNode = input.required<number | undefined>();

  styleClass = computed(() => {
    const selectedClasses = 'bg-blue-300/40 rounded px-0.5';
    const parentSelectedClasses = 'bg-green-300/40 rounded px-0.5';

    const classes: string[] = [];
    if (this.nodeData().tokensById) {
      classes.push('segment');
    } else {
      classes.push('group');
    }
    if (this.nodeData().id === this.selectedNode()) {
      classes.push(selectedClasses);
    }
    if (
      this.selectedNode() &&
      this.nodeData()
        .children.map((node) => node.id)
        .includes(this.selectedNode()!)
    ) {
      classes.push(parentSelectedClasses);
    }
    return classes.join(' ');
  });

  tokensOrdered = computed<string[]>(() =>
    [...this.nodeData().tokensById]
      .sort((a, b) => a.id - b.id)
      .map(({ token }) => token),
  );
}

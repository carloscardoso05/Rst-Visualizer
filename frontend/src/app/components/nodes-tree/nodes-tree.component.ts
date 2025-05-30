import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AllNodesGQL, AllNodesQuery } from './../../../generated/graphql';
import * as d3 from 'd3';
@Component({
  selector: 'app-nodes-tree',
  imports: [],
  templateUrl: './nodes-tree.component.html',
  styleUrl: './nodes-tree.component.css'
})
export class NodesTreeComponent implements OnInit {

  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;

  private data = {
    name: 'Root',
    children: [
      { name: 'Child 1' },
      { 
        name: 'Child 2',
        children: [
          { name: 'Grandchild 1' },
          { name: 'Grandchild 2' }
        ]
      }
    ]
  };

  private svg !: d3.Selection<SVGGElement, unknown, null, undefined>;
  private width = 600;
  private height = 400;
  private margin = { top: 20, right: 90, bottom: 30, left: 90 };

  constructor() {}

  ngOnInit(): void {
    this.createSvg();
    this.drawTree(this.data);
  }

  private createSvg(): void {
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private drawTree(data: any): void {
    const root = d3.hierarchy(data);

    const treeLayout = d3.tree<any>().size([this.height, this.width]);

    const treeData = treeLayout(root);

    const nodes = treeData.descendants();
    const links = treeData.links();

    // 🔗 Draw links
    this.svg.selectAll('path.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-width', 2)
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x)
      );

    // 🔘 Draw nodes
    const node = this.svg.selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 5)
      .attr('fill', '#69b3a2');

    node.append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => d.children ? -10 : 10)
      .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .text((d: any) => d.data.name);
  }
}

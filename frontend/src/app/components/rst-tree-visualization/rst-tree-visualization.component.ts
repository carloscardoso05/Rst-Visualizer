import { Component, Input, OnInit, AfterViewInit, ElementRef, signal, effect, inject } from '@angular/core';
import * as d3 from 'd3';
import { DocumentPageQueryQuery, DocumentTreeQueryGQL } from '../../../generated/graphql';

interface TreeNode {
  id: number;
  text: string;
  relationName?: string;
  relationType?: string;
  isMultinuclear: boolean;
  signals: Array<{
    text: string;
    type: string;
    subtype: string;
  }>;
  children?: TreeNode[];
  x?: number;
  y?: number;
}

interface D3TreeNode extends d3.HierarchyNode<TreeNode> {
  x: number;
  y: number;
}

@Component({
  selector: 'app-rst-tree-visualization',
  standalone: true,
  imports: [],
  templateUrl: './rst-tree-visualization.component.html',
  styleUrl: './rst-tree-visualization.component.css'
})
export class RstTreeVisualizationComponent implements OnInit, AfterViewInit {
  @Input() document: DocumentPageQueryQuery['documents'][number] | null = null;
  
  private readonly elementRef = inject(ElementRef);
  private readonly treeQuery = inject(DocumentTreeQueryGQL);
  
  readonly loading = signal(false);
  readonly error = signal<Error | null>(null);
  readonly treeData = signal<TreeNode | null>(null);
  readonly selectedNodeId = signal<number | null>(null);
  readonly highlightedRelation = signal<string | null>(null);

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private margin = { top: 50, right: 50, bottom: 50, left: 50 };
  private width = 1200 - this.margin.left - this.margin.right; // Increased width for longer text
  private height = 900 - this.margin.top - this.margin.bottom; // Increased height

  private selectedNodeIndex = signal<number>(0);
  private allNodes: any[] = [];

  constructor() {
    // Watch for document changes and reload tree data
    effect(() => {
      const doc = this.document;
      console.log('Tree component - document changed:', doc);
      if (doc) {
        console.log('Tree component - loading tree data for document ID:', doc.id);
        this.loadTreeData(doc.id);
      }
    });
  }

  ngOnInit(): void {
    console.log('Tree component - ngOnInit called');
  }

  ngAfterViewInit(): void {
    console.log('Tree component - ngAfterViewInit called');
    // Add a delay to ensure DOM is fully ready
    setTimeout(() => {
      console.log('Tree component - delayed initialization');
      this.initializeSVG();
      this.setupKeyboardNavigation();
      
      // If we have tree data, try to render immediately
      if (this.treeData()) {
        console.log('Tree component - tree data available, rendering');
        this.renderTree();
      }
    }, 200);
  }

  private loadTreeData(documentId: number): void {
    console.log('Tree component - loadTreeData called with ID:', documentId);
    this.loading.set(true);
    this.treeQuery.fetch({ id: documentId }).subscribe({
      next: (result) => {
        console.log('Tree component - GraphQL result:', result);
        if (result.data.documents.length > 0) {
          const document = result.data.documents[0];
          console.log('Tree component - document root:', document.root);
          const treeData = this.convertToTreeData(document.root);
          console.log('Tree component - converted tree data:', treeData);
          this.treeData.set(treeData);
          
          // Wait a bit to ensure SVG is initialized
          setTimeout(() => {
            this.renderTree();
          }, 100);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Tree component - GraphQL error:', error);
        this.error.set(error);
        this.loading.set(false);
      }
    });
  }

  private convertToTreeData(node: any): TreeNode {
    const converted = {
      id: node.id,
      text: node.text, // Store full text without truncation
      relationName: node.relation?.name,
      relationType: node.relation?.type,
      isMultinuclear: node.isMultinuclear,
      signals: node.signals || [],
      children: node.children?.map((child: any) => this.convertToTreeData(child)) || []
    };
    console.log('Converted node:', {
      id: converted.id,
      text: converted.text.substring(0, 30) + '...',
      childrenCount: converted.children.length,
      isMultinuclear: converted.isMultinuclear
    });
    return converted;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getNodeCount(): number {
    const data = this.treeData();
    if (!data) return 0;
    return this.countNodes(data);
  }

  private countNodes(node: TreeNode): number {
    let count = 1; // Count this node
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  private initializeSVG(): void {
    const container = this.elementRef.nativeElement.querySelector('.tree-container');
    if (!container) {
      console.error('Tree container not found');
      return;
    }
    
    // Clear any existing SVG
    d3.select(container).select('svg').remove();
    
    // Create SVG with proper dimensions
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .style('background-color', '#ffffff');

    // Create main group for tree content
    this.svg.append('g')
      .attr('class', 'tree-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
      
    console.log('SVG initialized successfully');
  }

  private renderTree(): void {
    console.log('renderTree called');
    if (!this.svg) {
      console.error('SVG not available for tree rendering');
      return;
    }
    
    if (!this.treeData()) {
      console.error('No tree data available');
      return;
    }

    const treeData = this.treeData()!;
    console.log('Rendering tree with data:', {
      id: treeData.id,
      text: treeData.text.substring(0, 50),
      childrenCount: treeData.children?.length || 0
    });
    
    // Clear previous content from tree group only
    const g = this.svg.select('.tree-group');
    if (g.empty()) {
      console.error('Tree group not found');
      return;
    }
    
    g.selectAll('*').remove();
    console.log('Cleared previous tree content');

    try {
      // Create VERTICAL tree layout (adapted for tree size and text length)
      const nodeCount = this.getNodeCount();
      const isLargeTree = this.shouldOptimizeForLargeTree();
      const treeHeight = isLargeTree ? Math.max(this.height - 100, nodeCount * 15) : this.height - 100;
      
      // Calculate dynamic spacing based on text length
      const avgTextLength = this.calculateAverageTextLength(treeData);
      console.log('Average text length for spacing calculation:', avgTextLength);
      
      // Calculate horizontal spacing based on text length
      // Base spacing of 120px, plus additional space for longer text
      const baseHorizontalSpacing = 120;
      const textBasedSpacing = Math.max(20, avgTextLength * 2.5); // 2.5px per character
      const horizontalSpacing = baseHorizontalSpacing + textBasedSpacing;
      
      // Vertical spacing remains consistent
      const verticalSpacing = 90;
      
      // Calculate dynamic canvas width to accommodate spacing
      const estimatedWidth = Math.max(this.width, nodeCount * horizontalSpacing * 0.5);
      
      console.log('Dynamic spacing calculated:', {
        avgTextLength,
        horizontalSpacing,
        verticalSpacing,
        estimatedWidth,
        nodeCount: nodeCount,
        treeOptimized: isLargeTree
      });
      
      const treeLayout = d3.tree<TreeNode>()
        .size([estimatedWidth, treeHeight])
        .nodeSize([horizontalSpacing, verticalSpacing]); // Dynamic node spacing

      // Create hierarchy from tree data
      const root = d3.hierarchy(treeData);
      console.log('Created hierarchy with', root.descendants().length, 'nodes');
      
      // Apply tree layout
      const treeWithPositions = treeLayout(root) as D3TreeNode;
      console.log('Applied tree layout, root at:', treeWithPositions.x, treeWithPositions.y);

      // Get all nodes
      const nodes = treeWithPositions.descendants();
      this.allNodes = nodes; // Store for keyboard navigation
      console.log('Tree nodes:', nodes.map(n => ({ id: n.data.id, x: n.x, y: n.y })));

      // Adjust canvas size based on actual tree dimensions
      this.adjustCanvasSize(nodes);

      // Create links (connections between nodes) - VERTICAL orientation
      if (nodes.length > 1) {
        const links = g.selectAll('.link')
          .data(treeWithPositions.links())
          .enter()
          .append('path')
          .attr('class', 'link')
          .attr('d', d => {
            // For vertical tree: x is horizontal, y is vertical
            const sourceX = d.source.x || 0;
            const sourceY = d.source.y || 0;
            const targetX = d.target.x || 0;
            const targetY = d.target.y || 0;
            
            // Curved vertical connections
            return `M${sourceX},${sourceY}
                    C${sourceX},${(sourceY + targetY) / 2}
                     ${targetX},${(sourceY + targetY) / 2}
                     ${targetX},${targetY}`;
          })
          .style('fill', 'none')
          .style('stroke', '#666')
          .style('stroke-width', '2px');
          
        console.log('Created', links.size(), 'links');
      }

      // Create node groups
      const nodeGroups = g.selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);

      console.log('Created', nodeGroups.size(), 'node groups');

      // Add circles for nodes
      nodeGroups.append('circle')
        .attr('r', d => d.data.isMultinuclear ? 12 : 8)
        .attr('class', d => d.data.isMultinuclear ? 'multinuclear' : 'mononuclear')
        .style('fill', d => d.data.isMultinuclear ? '#3b82f6' : '#10b981')
        .style('stroke', '#fff')
        .style('stroke-width', '3px')
        .style('cursor', 'pointer');

      // Add text labels with PROPER TEXT (not just "Node ID")
      const that = this; // Capture reference for use in nested functions
      const textGroups = nodeGroups.append('g')
        .attr('class', 'text-group');

      // Handle text with potential wrapping
      textGroups.each(function(d) {
        const textElement = d3.select(this);
        const fullText = d.data.text;
        const optimizedLength = that.getOptimizedTextLength();
        const truncatedText = that.truncateText(fullText, optimizedLength);
        
        // Decide whether to use multi-line text
        const shouldWrap = truncatedText.length > 40 && that.getNodeCount() < 30; // Only wrap for smaller trees
        
        // Log text processing stats for the first few nodes
        if (d.data.id <= 3) {
          console.log(`Node ${d.data.id} text processing:`, {
            originalLength: fullText.length,
            truncatedLength: truncatedText.length,
            optimizedLength,
            shouldWrap,
            isLargeTree: that.shouldOptimizeForLargeTree()
          });
        }
        
        if (shouldWrap) {
          // Multi-line text
          const wrappedLines = that.wrapText(truncatedText, 25);
          const lineHeight = 14;
          const startY = -(wrappedLines.length - 1) * lineHeight / 2;
          
          wrappedLines.forEach((line, index) => {
            textElement.append('text')
              .attr('dy', startY + (index * lineHeight))
              .attr('x', d.children ? -20 : 20)
              .style('text-anchor', d.children ? 'end' : 'start')
              .text(line)
              .style('font-size', '11px')
              .style('fill', '#333')
              .style('font-weight', 'normal')
              .attr('class', 'node-text-line');
          });
        } else {
          // Single line text
          textElement.append('text')
            .attr('dy', '0.35em')
            .attr('x', d.children ? -15 : 15)
            .style('text-anchor', d.children ? 'end' : 'start')
            .text(truncatedText)
            .style('font-size', '12px')
            .style('fill', '#333')
            .style('font-weight', 'normal')
            .attr('class', 'node-text');
        }
      });

      // Add relation labels for nodes that have them
      nodeGroups.filter(d => !!d.data.relationName)
        .append('text')
        .attr('dy', '1.5em')
        .attr('x', d => d.children ? -15 : 15)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.relationName || '')
        .style('font-size', '10px')
        .style('fill', '#666')
        .style('font-style', 'italic');

      console.log('Tree rendering completed successfully');

      // Add simple hover effects
      nodeGroups
        .on('mouseover', function(event, d) {
          console.log('Mouse over node:', d.data.id);
          d3.select(this).select('circle')
            .style('stroke-width', '5px')
            .style('filter', 'brightness(1.2)');
        })
        .on('mouseout', function(event, d) {
          d3.select(this).select('circle')
            .style('stroke-width', '3px')
            .style('filter', 'none');
        })
        .on('click', (event, d) => {
          console.log('Clicked node:', d.data.id, 'relation:', d.data.relationName);
          
          // Toggle selection
          const currentSelected = this.selectedNodeId();
          
          if (currentSelected === d.data.id) {
            // Deselect if clicking same node
            this.selectedNodeId.set(null);
            this.highlightedRelation.set(null);
            this.updateNodeHighlighting(null);
          } else {
            // Select new node and highlight its relation
            this.selectedNodeId.set(d.data.id);
            const relationName = d.data.relationName || null;
            this.highlightedRelation.set(relationName);
            this.updateNodeHighlighting(relationName);
          }
        });

      // Add zoom and pan functionality
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
          g.attr('transform', `translate(${this.margin.left + event.transform.x},${this.margin.top + event.transform.y}) scale(${event.transform.k})`);
        });

      this.svg.call(zoom);

      // Store all nodes for keyboard navigation
      this.allNodes = nodes;

      // Adjust canvas size based on actual tree dimensions
      this.adjustCanvasSize(nodes);

    } catch (error) {
      console.error('Error rendering tree:', error);
      
      // Fallback: render a simple error indicator
      g.append('text')
        .attr('x', 50)
        .attr('y', 50)
        .text('Error rendering tree: ' + error)
        .style('fill', 'red')
        .style('font-size', '14px');
    }
  }

  private addTooltips(nodes: any): void {
    // Remove existing tooltips
    d3.select('body').selectAll('.rst-tooltip').remove();

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'rst-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '350px')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)')
      .style('border', '1px solid rgba(255, 255, 255, 0.1)');

    nodes
      .on('mouseover', (event: any, d: any) => {
        let tooltipContent = `<div style="max-width: 300px;">`;
        tooltipContent += `<div style="font-weight: bold; margin-bottom: 8px; color: #3b82f6;">Nó ${d.data.id}</div>`;
        
        // Node type
        const nodeType = d.data.isMultinuclear ? 'Multinuclear' : 'Mononuclear';
        tooltipContent += `<div style="margin-bottom: 4px;"><strong>Tipo:</strong> ${nodeType}</div>`;
        
        // Text content (show much more text in tooltip)
        const truncatedText = this.truncateText(d.data.text, 300); // Show up to 300 characters
        tooltipContent += `<div style="margin-bottom: 4px;"><strong>Texto:</strong> ${truncatedText}</div>`;
        
        // Relation information
        if (d.data.relationName) {
          tooltipContent += `<div style="margin-bottom: 4px;"><strong>Relação:</strong> ${d.data.relationName}</div>`;
          if (d.data.relationType) {
            tooltipContent += `<div style="margin-bottom: 4px;"><strong>Tipo de Relação:</strong> ${d.data.relationType}</div>`;
          }
        }
        
        // Children count
        const childrenCount = d.children ? d.children.length : 0;
        if (childrenCount > 0) {
          tooltipContent += `<div style="margin-bottom: 4px;"><strong>Filhos:</strong> ${childrenCount}</div>`;
        }
        
        // Signals
        if (d.data.signals && d.data.signals.length > 0) {
          tooltipContent += `<div style="margin-bottom: 4px;"><strong>Sinais (${d.data.signals.length}):</strong></div>`;
          d.data.signals.slice(0, 3).forEach((signal: any) => {
            tooltipContent += `<div style="margin-left: 10px; font-size: 11px;">• ${signal.type}: ${this.truncateText(signal.text, 150)}</div>`; // Show more signal text
          });
          if (d.data.signals.length > 3) {
            tooltipContent += `<div style="margin-left: 10px; font-size: 11px; font-style: italic;">... e mais ${d.data.signals.length - 3}</div>`;
          }
        }
        
        tooltipContent += `<div style="margin-top: 8px; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 4px;">Clique para destacar relação</div>`;
        tooltipContent += `</div>`;

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
          
        tooltip.html(tooltipContent)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  }

  private updateNodeHighlighting(relationName: string | null): void {
    if (!this.svg) return;
    
    const g = this.svg.select('.tree-group');
    if (g.empty()) return;
    
    const selectedNodeId = this.selectedNodeId();
    
    // Reset all nodes to default styling
    g.selectAll('.node circle')
      .style('opacity', 1)
      .style('stroke-width', '3px')
      .style('filter', 'none');
    
    g.selectAll('.node text')
      .style('opacity', 1)
      .style('font-weight', 'normal');
    
    // If a relation is selected, highlight matching nodes
    if (relationName) {
      g.selectAll('.node')
        .each(function(d: any) {
          const nodeRelation = d.data.relationName;
          const isMatch = nodeRelation === relationName;
          const isSelected = d.data.id === selectedNodeId;
          
          // Dim non-matching nodes
          if (!isMatch && !isSelected) {
            d3.select(this).select('circle')
              .style('opacity', 0.3);
            d3.select(this).select('text')
              .style('opacity', 0.4);
          } else if (isMatch) {
            // Highlight matching nodes
            d3.select(this).select('circle')
              .style('stroke-width', '4px')
              .style('filter', 'brightness(1.1)');
            d3.select(this).select('text')
              .style('font-weight', 'bold');
          }
          
          // Special highlighting for selected node
          if (isSelected) {
            d3.select(this).select('circle')
              .style('stroke-width', '5px')
              .style('filter', 'brightness(1.3) drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))');
          }
        });
    }
  }

  clearSelection(): void {
    this.selectedNodeId.set(null);
    this.highlightedRelation.set(null);
    this.updateNodeHighlighting(null);
    this.announceToScreenReader('Seleção limpa');
  }

  private shouldOptimizeForLargeTree(): boolean {
    const nodeCount = this.getNodeCount();
    return nodeCount > 50; // Optimize for trees with more than 50 nodes
  }

  private getOptimizedTextLength(): number {
    return this.shouldOptimizeForLargeTree() ? 80 : 120; // Much more text visible
  }

  private setupKeyboardNavigation(): void {
    const container = this.elementRef.nativeElement.querySelector('.tree-container');
    if (!container) return;

    // Make container focusable
    container.setAttribute('tabindex', '0');
    container.style.outline = 'none';

    container.addEventListener('keydown', (event: KeyboardEvent) => {
      if (this.allNodes.length === 0) return;

      const currentIndex = this.selectedNodeIndex();
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          newIndex = Math.min(currentIndex + 1, this.allNodes.length - 1);
          event.preventDefault();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          newIndex = Math.max(currentIndex - 1, 0);
          event.preventDefault();
          break;
        case 'Home':
          newIndex = 0;
          event.preventDefault();
          break;
        case 'End':
          newIndex = this.allNodes.length - 1;
          event.preventDefault();
          break;
        case 'Enter':
        case ' ':
          if (this.allNodes[currentIndex]) {
            this.selectNodeByKeyboard(this.allNodes[currentIndex]);
          }
          event.preventDefault();
          break;
        case 'Escape':
          this.clearSelection();
          event.preventDefault();
          break;
      }

      if (newIndex !== currentIndex) {
        this.selectedNodeIndex.set(newIndex);
        this.highlightNavigatedNode(this.allNodes[newIndex]);
      }
    });
  }

  private highlightNavigatedNode(node: any): void {
    if (!this.svg) return;

    const g = this.svg.select('.tree-group');
    if (g.empty()) return;

    // Remove previous keyboard navigation highlight
    g.selectAll('.keyboard-highlight').remove();

    // Add keyboard navigation highlight
    const nodeGroup = g.selectAll('.node')
      .filter((d: any) => d.data.id === node.data.id);

    nodeGroup.append('circle')
      .attr('class', 'keyboard-highlight')
      .attr('r', node.data.isMultinuclear ? 16 : 12)
      .style('fill', 'none')
      .style('stroke', '#f59e0b')
      .style('stroke-width', '2px')
      .style('stroke-dasharray', '5,5');
  }

  private selectNodeByKeyboard(node: any): void {
    const nodeData = node.data;
    this.selectedNodeId.set(nodeData.id);
    const relationName = nodeData.relationName || null;
    this.highlightedRelation.set(relationName);
    this.updateNodeHighlighting(relationName);
    
    // Announce to screen reader
    const nodeType = nodeData.isMultinuclear ? 'multinuclear' : 'mononuclear';
    const announcement = `Nó ${nodeData.id} selecionado. Tipo: ${nodeType}. ${relationName ? `Relação: ${relationName}` : 'Sem relação'}`;
    this.announceToScreenReader(announcement);
  }

  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  private calculateAverageTextLength(node: TreeNode): number {
    const textLengths: number[] = [];
    
    const collectTextLengths = (n: TreeNode) => {
      if (n.text) {
        const displayLength = Math.min(n.text.length, this.getOptimizedTextLength());
        textLengths.push(displayLength);
      }
      if (n.children) {
        n.children.forEach(child => collectTextLengths(child));
      }
    };
    
    collectTextLengths(node);
    
    if (textLengths.length === 0) return 50; // Default fallback
    
    const average = textLengths.reduce((sum, len) => sum + len, 0) / textLengths.length;
    return Math.max(50, Math.min(150, average)); // Keep within reasonable bounds
  }

  private wrapText(text: string, maxCharsPerLine: number = 30): string[] {
    if (text.length <= maxCharsPerLine) {
      return [text];
    }
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, split it
          lines.push(word.substring(0, maxCharsPerLine));
          currentLine = word.substring(maxCharsPerLine);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.slice(0, 3); // Limit to 3 lines maximum
  }

  private adjustCanvasSize(nodes: any[]): void {
    if (nodes.length === 0) return;
    
    // Calculate actual bounds of the tree
    const xValues = nodes.map(n => n.x || 0);
    const yValues = nodes.map(n => n.y || 0);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    const padding = 100; // Extra padding around content
    const contentWidth = maxX - minX + (2 * padding);
    const contentHeight = maxY - minY + (2 * padding);
    
    // Update canvas size if content is larger than current size
    const currentWidth = this.width + this.margin.left + this.margin.right;
    const currentHeight = this.height + this.margin.top + this.margin.bottom;
    
    if (contentWidth > currentWidth || contentHeight > currentHeight) {
      const newWidth = Math.max(currentWidth, contentWidth);
      const newHeight = Math.max(currentHeight, contentHeight);
      
      console.log('Adjusting canvas size:', {
        current: { width: currentWidth, height: currentHeight },
        content: { width: contentWidth, height: contentHeight },
        new: { width: newWidth, height: newHeight }
      });
      
      // Update SVG size
      if (this.svg) {
        this.svg
          .attr('width', newWidth)
          .attr('height', newHeight);
      }
    }
  }
}

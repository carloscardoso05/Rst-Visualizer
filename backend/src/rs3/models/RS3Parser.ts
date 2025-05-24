import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getDocumentCodeFromName, isValidDocumentName } from '../util/document-util';
import { RS3Document } from './document';
import { Group } from './group.model';
import { Node } from './node.model';
import { Relation } from './relation.model';
import { Segment } from './segment.model';
import { Signal } from './signal.model';
import { TokenId } from './token-id.model';

export interface IRelationData {
    '@_name': string;
    '@_type': string;
}

export interface ISignalData {
    '@_source': string;
    '@_type': string;
    '@_subtype': string;
    '@_tokens'?: string;
}

export interface ISegmentData {
    '@_id': string;
    '@_parent'?: string;
    '@_relname'?: string;
    '#text'?: string;
}

export interface IGroupData {
    '@_id': string;
    '@_parent'?: string;
    '@_relname'?: string;
    '@_type': string;
}

export interface IRS3 {
    header: {
        relations: {
            rel: IRelationData[];
        };
    };
    body: {
        segment: ISegmentData[];
        group: IGroupData[];
        signals?: {
            signal: ISignalData[];
        };
    };
}

export class RS3Parser {
    relations = new Map<string, Relation>();
    segments = new Map<number, Segment>();
    groups = new Map<number, Group>();
    signals = new Map<number, Signal>();
    get nodes(): Map<number, Node> {
        return new Map<number, Node>([...this.segments, ...this.groups],);
    }
    rootNode!: Node;

    constructor(private filePath: string) { }

    async toRS3Document(): Promise<RS3Document> {
        await this.init();
        const document = new RS3Document();
        document.path = this.filePath;
        document.name = path.basename(document.path);
        document.code = getDocumentCodeFromName(document.name);
        document.relations = Array.from(this.relations.values());
        document.segments = Array.from(this.segments.values());
        document.groups = Array.from(this.groups.values());
        document.signals = Array.from(this.signals.values());
        document.intraSententialRelations = this.getIntraSententialRelations();
        return document;
    }


    private async init() {
        if (!isValidDocumentName(path.basename(this.filePath))) {
            throw new Error(`Invalid document name: ${path.basename(this.filePath)}`);
        }
        const stat = await fs.stat(this.filePath);
        if (stat.isDirectory()) {
            throw new Error(`File path is a directory: ${this.filePath}`);
        }
        const xml = await fs.readFile(this.filePath, 'utf-8');
        const parser = new XMLParser({ ignoreAttributes: false });
        const data = parser.parse(xml) as { rst: IRS3 };

        // segments
        for (const [index, segmentData] of data.rst.body.segment.entries()) {
            const segment = Segment.fromData(segmentData, index);
            this.segments.set(segment.id, segment);
        }

        // groups
        for (const groupData of data.rst.body.group) {
            const group = Group.fromData(groupData);
            this.groups.set(group.id, group);
        }

        // set parent-child relationships
        for (const node of this.nodes.values()) {
            if (node.parentId) {
                const parent = this.nodes.get(node.parentId);
                if (!parent) {
                    throw new Error(`Parent node with ID ${node.parentId} not found for node ${node.id}`);
                }
                node.parent = parent;
                parent.children.push(node);
            }
        }

        // relations
        for (const relationData of data.rst.header.relations.rel) {
            const relation = Relation.fromData(relationData);
            this.relations.set(relation.name, relation);
            for (const node of this.nodes.values()) {
                if (node.relationName === relation.name) {
                    node.relation = relation;
                    relation.nodes.push(node);
                }
            }
        }

        // signals
        for (const [index, signalData] of data.rst.body.signals?.signal.entries() ?? []) {
            const signal = Signal.fromData(signalData, index);
            signal.parser = this
            this.signals.set(signal.id, signal);
            const sourceNode = this.nodes.get(signal.sourceId);
            if (!sourceNode) {
                throw new Error(`Source node with ID ${signal.sourceId} not found for signal ${signal.id}`);
            }
            signal.source = sourceNode;
            sourceNode.signals.push(signal);
        }

        // find root
        for (const node of this.nodes.values()) {
            if (node.isRoot) {
                this.rootNode = node;
                break;
            }
        }

        // assign sentence/token IDs
        let sentenceId = 1;
        let tokenCursor = 1;
        for (const segment of this.getSortedSegments()) {
            segment.sentenceId = sentenceId;
            segment._initialTokenId = tokenCursor;
            const tokens = segment.innterTokensIds.map(t => t.token);
            if (/[.?!]['"]?\s*$/.test(tokens[tokens.length - 1] || '')) {
                sentenceId++;
            }
            tokenCursor += tokens.length;
        }
    }

    getSortedSegments(): Segment[] {
        return Array.from(this.segments.values()).sort((a, b) => a.order - b.order);
    }

    getTokens(): string[] {
        return this.rootNode.subtreeSegmentsTexts;
    }

    getTokensDict(): Map<number, string> {
        const dict = new Map<number, string>();
        this.getTokens().forEach((tok, idx) => {
            dict.set(idx + 1, tok);
        });
        return dict;
    }

    getText(): string {
        return this.rootNode.text;
    }

    countIntraSententialRelations(): Record<string, number> {
        const counts: Record<string, number> = {};
        for (const node of this.getIntraSententialRelations()) {
            const name = node.relation?.name || 'undefined';
            counts[name] = (counts[name] || 0) + 1;
        }
        return counts;
    }

    getIntraSententialRelations(): Node[] {
        return Array.from(this.nodes.values()).filter(n => this.toCount(n));
    }

    private toCount(node: Node): boolean {
        if (!node.relation || node.relation.name === 'span') return false;
        if (node.isMultinuclear) {
            const siblings = node.siblingsOfSameRelation;
            if (node.relation.name === 'same-unit') {
                return siblings[0].id === node.id;
            } else {
                const idx = siblings.findIndex(n => n.id === node.id);
                if (idx + 1 === siblings.length) return false;
                const right = siblings[idx + 1];
                return this.areSameSentence([node.parent, right]);
            }
        }
        return this.areSameSentence([node.parent, node]);
    }

    private areSameSentence(nodes: (Node | undefined)[]): boolean {
        const segs: Segment[] = [];
        for (const n of nodes) {
            if (!n) continue;
            if (n instanceof Segment) segs.push(n);
            else segs.push(...n.subtreeSegments);
        }
        if (segs.length <= 1) return true;
        const sid = segs[0].sentenceId;
        return segs.every(s => s.sentenceId === sid);
    }
}
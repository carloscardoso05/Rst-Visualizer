import { promises as fs } from 'fs';
import { XMLParser } from 'fast-xml-parser';

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
        signals: {
            signal: ISignalData[];
        };
    };
}

export class Relation {
    name: string;
    type: string;

    constructor(data: IRelationData) {
        this.name = data['@_name'];
        this.type = data['@_type'];
    }
}

export class Node {
    id: number;
    parentId: number | null;
    relname: string | null;
    signals: Signal[] = [];
    parser!: RS3Parser;

    constructor(id: number, parentId: number | null, relname: string | null) {
        this.id = id;
        this.parentId = parentId;
        this.relname = relname;
    }

    isMultinuclear(): boolean {
        return ['sequence', 'same-unit', 'list', 'contrast', 'joint', 'other-rel', null].includes(this.relname);
    }

    get parent(): Node | null {
        return this.parentId === null ? null : this.parser.nodes.get(this.parentId)!;
    }

    get children(): Node[] {
        return Array.from(this.parser.nodes.values())
            .filter(n => n.parentId === this.id);
    }

    get siblings(): Node[] {
        return Array.from(this.parser.nodes.values())
            .filter(n => n.parentId === this.parentId);
    }

    getSiblingsOfSameRel(): Node[] {
        return this.siblings.filter(n => n.relname === this.relname);
    }

    isRoot(): boolean {
        return this.parentId === null && this.relname === null;
    }

    getDeepSegments(): Segment[] {
        const segs: Segment[] = [];
        if (this instanceof Segment) segs.push(this);
        for (const c of this.children) {
            segs.push(...c.getDeepSegments());
        }
        return segs.sort((a, b) => a.order - b.order);
    }

    getTokens(): string[] {
        return this.getDeepSegments().flatMap(s => s.innerText.split(/\s+/).filter(Boolean));
    }

    getText(): string {
        return this.getTokens().join(' ');
    }
}

export class Segment extends Node {
    order: number;
    innerText: string;
    sentenceId = -1;
    initialTokenId = -1;

    constructor(data: ISegmentData, order: number) {
        super(
            parseInt(data['@_id'], 10),
            data['@_parent'] ? parseInt(data['@_parent'], 10) : null,
            data['@_relname'] ?? null
        );
        this.order = order;
        this.innerText = data['#text']?.trim() ?? '';
    }
}

export class Group extends Node {
    type: string;

    constructor(data: IGroupData) {
        super(
            parseInt(data['@_id'], 10),
            data['@_parent'] ? parseInt(data['@_parent'], 10) : null,
            data['@_relname'] ?? null
        );
        this.type = data['@_type'];
    }
}

export class Signal {
    id: number;
    sourceId: number;
    type: string;
    subtype: string;
    tokenIds: number[];
    parser!: RS3Parser;

    constructor(id: number, data: ISignalData) {
        this.id = id;
        this.sourceId = parseInt(data['@_source'], 10);
        this.type = data['@_type'];
        this.subtype = data['@_subtype'];
        this.tokenIds = data['@_tokens']
            ? data['@_tokens'].split(',').map(t => parseInt(t, 10))
            : [];
    }

    get tokens(): string[] {
        const dict = this.parser.getTokensDict();
        return this.tokenIds.map(i => dict.get(i)).filter((t): t is string => !!t);
    }

    get text(): string {
        return this.tokens.join(' ');
    }

    get source(): Node {
        return this.parser.nodes.get(this.sourceId)!;
    }
}

export class RS3Parser {
    relations = new Map<string, Relation>();
    segments = new Map<number, Segment>();
    groups = new Map<number, Group>();
    signals = new Map<number, Signal>();
    nodes = new Map<number, Node>();
    rootNode!: Node;

    constructor(private filePath: string) { }

    async init() {
        const xml = await fs.readFile(this.filePath, 'utf-8');
        const parser = new XMLParser({ ignoreAttributes: false });
        const data = parser.parse(xml) as { rs3: IRS3 };

        // relations
        for (const rel of data.rs3.header.relations.rel) {
            const r = new Relation(rel);
            this.relations.set(r.name, r);
        }

        // segments
        data.rs3.body.segment.forEach((segData, idx) => {
            const seg = new Segment(segData, idx);
            seg.parser = this;
            this.segments.set(seg.id, seg);
        });

        // groups
        data.rs3.body.group.forEach(gData => {
            const grp = new Group(gData);
            grp.parser = this;
            this.groups.set(grp.id, grp);
        });

        // merge nodes
        for (const [id, node] of [...this.segments, ...this.groups]) {
            this.nodes.set(id, node);
        }

        // signals
        data.rs3.body.signals.signal.forEach((sigData, idx) => {
            const sig = new Signal(idx, sigData);
            sig.parser = this;
            this.signals.set(idx, sig);
            // attach to source node
            this.nodes.get(sig.sourceId)!.signals.push(sig);
        });

        // find root
        for (const node of this.nodes.values()) {
            if (node.isRoot()) {
                this.rootNode = node;
                break;
            }
        }

        // assign sentence/token IDs
        let sentenceId = 1;
        let tokenCursor = 1;
        for (const seg of this.getSortedSegments()) {
            seg.sentenceId = sentenceId;
            seg.initialTokenId = tokenCursor;
            const tokens = seg.getTokens();
            // if ends with .,? or ! then new sentence
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
        return this.rootNode.getTokens();
    }

    getTokensDict(): Map<number, string> {
        const dict = new Map<number, string>();
        this.getTokens().forEach((tok, idx) => {
            dict.set(idx + 1, tok);
        });
        return dict;
    }

    getText(): string {
        return this.rootNode.getText();
    }

    countIntraSententialRelations(): Record<string, number> {
        const counts: Record<string, number> = {};
        for (const node of this.getIntraSententialRelations()) {
            const name = node.relname!;
            counts[name] = (counts[name] || 0) + 1;
        }
        return counts;
    }

    getIntraSententialRelations(): Node[] {
        return Array.from(this.nodes.values()).filter(n => this.toCount(n));
    }

    private toCount(node: Node): boolean {
        if (node.relname === 'span' || node.relname === null) return false;
        if (node.isMultinuclear()) {
            const sibs = node.getSiblingsOfSameRel();
            if (node.relname === 'same-unit') {
                return sibs[0].id === node.id;
            } else {
                const idx = sibs.findIndex(n => n.id === node.id);
                if (idx + 1 === sibs.length) return false;
                const right = sibs[idx + 1];
                return this.areSameSentence([node.parent, right]);
            }
        }
        return this.areSameSentence([node.parent, node]);
    }

    private areSameSentence(nodes: (Node | null)[]): boolean {
        const segs: Segment[] = [];
        for (const n of nodes) {
            if (!n) continue;
            if (n instanceof Segment) segs.push(n);
            else segs.push(...n.getDeepSegments());
        }
        if (segs.length <= 1) return true;
        const sid = segs[0].sentenceId;
        return segs.every(s => s.sentenceId === sid);
    }
}
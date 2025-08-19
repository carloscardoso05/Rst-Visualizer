import { Logger } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import getFileInfo from 'detect-file-encoding-and-language';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import { single } from 'src/utils/array-util';
import { Group, Node, Segment } from './node.model';
import { Relation } from './relation.model';
import { Signal } from './signal.model';
import { GroupXml, RstSchema, SegmentXml, SignalXml } from './xml.model';

@ObjectType()
export class Rst {
  private readonly logger = new Logger(Rst.name);

  @Field()
  id: number;
  filePath: string;
  root: Node;

  @Field()
  get name(): string {
    return path.basename(this.filePath);
  }

  @Field()
  get code(): string {
    const match = single(this.name.match(/D\d+_C\d+\D/i)!);
    const code = match.substring(0, match.length - 1);
    return code;
  }

  constructor(id: number, filePath: string) {
    this.id = id;
    this.filePath = filePath;
  }

  async initialize(): Promise<void> {
    const fileInfo = await getFileInfo(this.filePath);
    const xmlContent = fs.readFileSync(
      this.filePath,
      fileInfo.encoding as BufferEncoding,
    );
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: 'text',
    });
    const result = RstSchema.safeParse(await xmlParser.parse(xmlContent));

    if (!result.success) {
      const error = new Error(`Invalid xml: ${this.filePath}`, {
        cause: result.error,
      });
      this.logger.error(error);
      throw error;
    }

    const xml = result.data;

    // Parse relations
    const relationsXml = xml.rst.header.relations.rel;
    const relations: Map<string, Relation> = new Map();

    // Add default span relation
    relations.set('span', new Relation('span', 'multinuc'));

    // Add other relations
    relationsXml.forEach((rel) => {
      const relation = new Relation(rel.name, rel.type);
      relations.set(relation.name, relation);
    });

    // Parse groups and segments
    const groupDicts: Array<GroupXml> = xml.rst.body.group;
    const segmentDicts: Array<SegmentXml> = xml.rst.body.segment;
    const signalDicts: Array<SignalXml> = xml.rst.body.signals?.signal ?? [];

    const groups = new Map<number, Group>();
    const segments = new Map<number, Segment>();

    // Create groups
    groupDicts.forEach((groupDict) => {
      const relation = groupDict.relname
        ? relations.get(groupDict.relname)!
        : undefined;
      const group = new Group(
        groupDict.id,
        relation,
        groupDict.parent,
        groupDict.type,
      );
      groups.set(group.id, group);
    });

    // Create segments
    segmentDicts.forEach((segmentDict, index) => {
      const relation = relations.get(segmentDict.relname)!;
      if (!relation) {
        const error = new Error(`Relation ${segmentDict.relname} not found`);
        this.logger.error(error);
        throw error;
      }

      const segment = new Segment(
        segmentDict.id,
        relation,
        segmentDict.parent,
        segmentDict.text,
        index,
      );
      segments.set(segment.id, segment);
    });

    // Combine all nodes
    const nodes = new Map<number, Node>([...groups, ...segments]);

    // Create signals
    signalDicts.forEach((signalDict, index) => {
      const sourceNode = nodes.get(signalDict.source);
      if (sourceNode) {
        const signal = new Signal(
          index,
          signalDict.source,
          sourceNode,
          signalDict.type,
          signalDict.subtype,
          signalDict.tokens,
        );
        sourceNode.signals.push(signal);
      }
    });

    // Build tree structure
    nodes.forEach((node) => {
      if (node.parentId !== undefined) {
        const parent = nodes.get(node.parentId);
        if (parent) {
          node.parent = parent;
          parent.children.push(node);
        }
      }
    });

    // Sort children by order
    nodes.forEach((node) => {
      node.children.sort((a, b) => a.order - b.order);
    });

    // Find root node
    const rootGroups = Array.from(groups.values()).filter(
      (group) => !group.parent,
    );
    if (rootGroups.length === 0) {
      const error = new Error('No root node found');
      this.logger.error(error);
      throw error;
    }
    this.root = rootGroups[0].getRoot();

    // Assign sentence and token IDs
    let sentenceId = 1;
    let tokenId = 1;
    const orderedSegments = this.root.getSubtreeSegmentsOrdered();

    orderedSegments.forEach((segment) => {
      segment.sentenceId = sentenceId;
      segment.initialTokenId = tokenId;

      // Check if sentence ends
      const cleanText = segment.innerText
        .replace(/\s/g, '')
        .replace(/"/g, '')
        .replace(/'/g, '');

      if (
        cleanText.endsWith('.') ||
        cleanText.endsWith('?') ||
        cleanText.endsWith('!')
      ) {
        sentenceId++;
      }

      tokenId += segment.getTokensDict().size;
    });
  }
}

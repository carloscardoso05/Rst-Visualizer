import { z } from 'zod';

const RelSchema = z.object({
  name: z.enum([
    '',
    'span',
    'antithesis-e',
    'antithesis',
    'attribution-e',
    'attribution',
    'background-e',
    'background',
    'circumstance-e',
    'circumstance',
    'comparison-e',
    'comparison',
    'concession-e',
    'concession',
    'conclusion-e',
    'conclusion',
    'condition-e',
    'condition',
    'contrast',
    'elaboration-e',
    'elaboration',
    'enablement-e',
    'enablement',
    'evaluation-e',
    'evaluation',
    'evidence-e',
    'evidence',
    'explanation-e',
    'explanation',
    'interpretation-e',
    'interpretation',
    'joint',
    'justify-e',
    'justify',
    'list',
    'means-e',
    'means',
    'motivation-e',
    'motivation',
    'non-volitional-cause-e',
    'non-volitional-cause',
    'non-volitional-result-e',
    'non-volitional-result',
    'other-rel-e',
    'other-rel',
    'otherwise-e',
    'otherwise',
    'parenthetical',
    'purpose-e',
    'purpose',
    'restatement-e',
    'restatement',
    'same-unit',
    'sequence',
    'solutionhood-e',
    'solutionhood',
    'summary-e',
    'summary',
    'volitional-cause-e',
    'volitional-cause',
    'volitional-result-e',
    'volitional-result',
  ]),
  type: z.enum(['rst', 'multinuc']),
});

export const RstSchema = z.object({
  rst: z.object({
    header: z.object({
      relations: z.object({
        rel: z.array(RelSchema),
      }),
    }),
    body: z.object({
      segment: z.array(
        z.object({
          id: z.coerce.number().int(),
          text: z.string(),
          parent: z.coerce.number().int(),
          relname: z.string(),
        }),
      ),
      group: z.array(
        z.object({
          id: z.coerce.number().int(),
          type: z.string(),
          parent: z.coerce.number().int().optional(),
          relname: z.string().optional(),
        }),
      ),
      signals: z
        .object({
          signal: z.array(
            z.object({
              source: z.coerce.number().int(),
              type: z.string(),
              subtype: z.string(),
              tokens: z.transform(
                (tokens?: string): number[] =>
                  tokens?.split(',').map(Number) ?? [],
              ),
            }),
          ),
        })
        .optional(),
    }),
  }),
});

export type RstXml = z.infer<typeof RstSchema>;
export type GroupXml = RstXml['rst']['body']['group'][number];
export type SegmentXml = RstXml['rst']['body']['segment'][number];
export type SignalXml = Exclude<
  RstXml['rst']['body']['signals'],
  undefined
>['signal'][number];
export type RelationXml = RstXml['rst']['header']['relations']['rel'][number];

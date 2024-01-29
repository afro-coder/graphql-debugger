import { BaseTrace } from "@graphql-debugger/adapter-base";
import {
  CreateTraceResponseSchema,
  TraceSchema,
  UpdateTraceResponseSchema,
} from "@graphql-debugger/schemas";
import {
  CreateTraceInput,
  CreateTraceResponse,
  FindFirstTraceOptions,
  FindFirstTraceWhere,
  ListTraceGroupsWhere,
  Span,
  Trace,
  UpdateTraceInput,
  UpdateTraceResponse,
  UpdateTraceWhere,
} from "@graphql-debugger/types";
import { dbSpanToNetwork } from "@graphql-debugger/utils";

import { prisma } from "../prisma";

export class SQLiteTrace extends BaseTrace {
  constructor() {
    super();
  }

  public async findFirst({
    where,
    options,
  }: {
    where: FindFirstTraceWhere;
    options?: FindFirstTraceOptions;
  }): Promise<Trace | null> {
    const trace = await prisma.traceGroup.findFirst({
      where: {
        traceId: where.traceId,
      },
      include: {
        ...(options?.includeSpans
          ? {
              spans: true,
            }
          : {}),
      },
    });

    if (!trace) {
      return null;
    }

    const spans = (trace?.spans || []).map((span) => dbSpanToNetwork(span));
    const rootSpan = spans.find((span) => span.isGraphQLRootSpan);

    const response = {
      id: trace.id,
      traceId: trace.traceId,
      ...(options?.includeSpans
        ? {
            spans,
            rootSpan,
          }
        : {
            spans: [],
          }),
    };

    const parsed = TraceSchema.parse(response);

    return parsed;
  }

  public async findMany(args: {
    where: ListTraceGroupsWhere;
    includeSpans?: boolean;
    includeRootSpan?: boolean;
  }): Promise<(Trace & { spans: Span[] })[]> {
    const whereConditions: any = [
      {
        spans: {
          some: {
            isGraphQLRootSpan: true,
          },
        },
      },
    ];

    if (args.where?.id) {
      whereConditions.push({ id: args.where.id });
    }

    if (args.where?.schemaId) {
      whereConditions.push({ schemaId: args.where.schemaId });
    }

    if (args.where?.rootSpanName) {
      whereConditions.push({
        spans: {
          some: {
            name: {
              equals: args.where.rootSpanName,
            },
          },
        },
      });
    }

    if (args.where?.traceIds) {
      whereConditions.push({ traceId: { in: args.where.traceIds } });
    }

    const where = {
      AND: whereConditions,
    };

    const traces = await prisma.traceGroup.findMany({
      orderBy: { createdAt: "desc" },
      where,
      take: 20,
      include: {
        ...(args.includeSpans
          ? {
              spans: true,
            }
          : {}),
      },
    });

    const response = traces.map((trace) => {
      const spans = (trace?.spans || []).map((span) => dbSpanToNetwork(span));

      return {
        id: trace.id,
        traceId: trace.traceId,
        schemaId: trace.schemaId,
        spans,
        rootSpan: spans.find((span) => span.isGraphQLRootSpan),
      };
    });

    const parsed = TraceSchema.array().parse(response);

    return parsed;
  }

  public async createOne({
    input,
  }: {
    input: CreateTraceInput;
  }): Promise<CreateTraceResponse> {
    const trace = await prisma.traceGroup.create({
      data: {
        traceId: input.traceId,
        schemaId: input.schemaId,
      },
    });

    const response: CreateTraceResponse = {
      trace: {
        id: trace.id,
        traceId: trace.traceId,
        schemaId: trace.schemaId,
        spans: [],
      },
    };

    const parsed = CreateTraceResponseSchema.parse(response);

    return parsed;
  }

  public async updateOne({
    where,
    input,
  }: {
    where: UpdateTraceWhere;
    input: UpdateTraceInput;
  }): Promise<UpdateTraceResponse> {
    const schema = await prisma.schema.findFirst({
      where: {
        id: input.schemaId,
      },
    });

    if (!schema) {
      throw new Error("Schema not found");
    }

    const trace = await prisma.traceGroup.update({
      where: {
        id: where.id,
      },
      data: {
        schemaId: input.schemaId,
      },
    });

    if (!trace) {
      throw new Error("Trace not found");
    }

    const response = {
      trace: {
        id: trace.id,
        traceId: trace.traceId,
        schemaId: trace.schemaId,
        spans: [],
      },
    };

    const parsed = UpdateTraceResponseSchema.parse(response);

    return parsed;
  }
}

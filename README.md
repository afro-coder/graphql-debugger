<div align="center" style="text-align: center;">

<img src="./packages/ui/public/logo.svg" width="20%" alt="GraphQL Debugger">

<h1>GraphQL Debugger</h1>

<p>Debug your GraphQL server locally.</p>

[![Test](https://github.com/rocket-connect/graphql-debugger/actions/workflows/test.yml/badge.svg?branch=main&event=push)](https://github.com/rocket-connect/graphql-debugger/actions/workflows/test.yml) [![npm version](https://badge.fury.io/js/graphql-debugger.svg)](https://badge.fury.io/js/graphql-debugger) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<img src="./docs/screenshot.png" width="100%" alt="GraphQL Debugger">
</div>

## About

GraphQL Debugger is a [Open Telemetry](https://opentelemetry.io/) collector with a user interface that is tailored for debugging GraphQL servers.

It is designed to be used during development, to help you spot errors, slow queries and inconsistencies without having to use console.log.

To get started, use the [trace schema package](https://github.com/rocket-connect/graphql-debugger/tree/main/packages/trace-schema) to trace your schema, and then run the GraphQL Debugger CLI to start debugging:

```
npx graphql-debugger
```

## Contributing

We welcome contributions to GraphQL Debugger. Please read our [contributing guide](./docs/CONTRIBUTING.md) to get started.

## Packages

- [ `@graphql-debugger/ui`](./packages/ui/README.md) - Frontend
- [`@graphql-debugger/collector-proxy`](./packages/collector-proxy/README.md) - Data Collector
- [`@graphql-debugger/trace-schema`](./packages/trace-schema/README.md) - Schema Plugin
- [`@graphql-debugger/utils`](./packages/utils/README.md) - Utilities
- [`@graphql-debugger/time`](./packages/time/README.md) - Time Utils
- [`@graphql-debugger/data-access`](./packages/data-access/README.md) - Data Access
- [`@graphql-debugger/e2e`](./e2e/README.md) - E2E Tests
- [`graphql-debugger`](./packages/graphql-debugger/README.md) - CLI

## Getting Started

### Install

Install the GraphQL Debugger CLI and trace schema package.

```
npm i graphql-debugger @graphql-debugger/trace-schema
```

### Trace your schema

```ts
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createYoga } from 'graphql-yoga';
import { traceSchema, GraphQLOTELContext } from '@graphql-debugger/trace-schema';

// Common GraphQL schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Wrap all resolvers and fields with tracing
const tracedSchema = traceSchema({
  schema,
});

const yoga = createYoga({
  schema: tracedSchema,
  context: (req) => {
    return {
      // Include variables, result and context in traces
      GraphQLOTELContext: new GraphQLOTELContext({
        includeVariables: true,
        includeResult: true,
        includeContext: true,
      }),
    };
  },
});
```

### Run the Debugger

```
npx graphql-debugger
```

Navgiating to [http://localhost:16686](http://localhost:16686) will open the GraphQL Debugger UI.

## License

MIT - Rocket Connect - https://github.com/rocket-connect

import { Schema } from "./entities/Schema";
import { Span } from "./entities/Span";
import { Trace } from "./entities/Trace";
import { ClientOptions } from "./types";

export const DEFAULT_BACKEND_URL = "http://localhost:16686";
export const DEFAULT_COLLECTOR_URL = "http://localhost:4318";

export class DebuggerClient {
  private clientOptions: ClientOptions;

  constructor(
    clientOptions: ClientOptions = {
      backendUrl: DEFAULT_BACKEND_URL,
      collectorUrl: DEFAULT_COLLECTOR_URL,
    },
  ) {
    this.clientOptions = clientOptions;
  }

  get schema() {
    return new Schema(this.clientOptions);
  }

  get trace() {
    return new Trace(this.clientOptions);
  }

  get span() {
    return new Span(this.clientOptions);
  }
}

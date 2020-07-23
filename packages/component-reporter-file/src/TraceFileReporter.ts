import {
  FileLoggerManager,
  ILogger,
} from '@pandorajs/component-file-logger-service';
import * as tracing from '@opentelemetry/tracing';
import { hrTimeToMilliseconds } from './util';

export class TraceFileReporter implements tracing.SpanExporter {
  type = 'trace';
  logger: ILogger;
  constructor(private ctx: any) {
    const { reporterFile: config } = ctx.config;
    const fileLoggerManager: FileLoggerManager = this.ctx.fileLoggerManager;
    this.logger = fileLoggerManager.createLogger('pandora-traces', {
      ...config.trace,
      dir: config.logsDir,
    });
  }

  /**
   * @param spans
   */
  export(spans: tracing.ReadableSpan[]) {
    const globalTags = this.getGlobalTags();
    for (const it of spans) {
      this.logger.log(
        'INFO',
        [
          JSON.stringify({
            traceId: it.spanContext.traceId,
            spanId: it.spanContext.spanId,
            parentSpanId: it.parentSpanId,
            name: it.name,
            status: it.status,
            startTime: hrTimeToMilliseconds(it.startTime),
            endTime: hrTimeToMilliseconds(it.endTime),
            duration: hrTimeToMilliseconds(it.duration),
            ended: it.ended,
            kind: it.kind,
            context: it.spanContext,
            links: it.links,
            attributes: it.attributes,
            events: it.events,
            // TODO: User data
            ...globalTags,
          }),
        ],
        { raw: true }
      );
    }
  }

  shutdown() {}

  getGlobalTags() {
    const { reporterFile: config } = this.ctx.config;
    return config.globalTags;
  }
}

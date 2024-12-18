import type { DateParser } from '../../../introspector';
import { MysqlIntrospectorDialect } from '../../../introspector/dialects/mysql/mysql-dialect';
import type { TimestampParser } from '../../../introspector/dialects/shared/timestamp-parser';
import type { GeneratorDialect } from '../../dialect';
import { MysqlAdapter } from './mysql-adapter';

type MysqlDialectOptions = {
  dateParser?: DateParser<'date' | 'datetime'>;
  timestampParser?: TimestampParser;
};

export class MysqlDialect
  extends MysqlIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter: MysqlAdapter;

  constructor(options?: MysqlDialectOptions) {
    super(options);

    this.adapter = new MysqlAdapter({
      dateParser: this.options.dateParser,
      timestampParser: this.options.timestampParser,
    });
  }
}

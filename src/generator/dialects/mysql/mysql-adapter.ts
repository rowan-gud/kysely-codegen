import { DateParserKind, type DateParser } from '../../../introspector';
import {
  TimestampParserKind,
  type TimestampParser,
} from '../../../introspector/dialects/shared/timestamp-parser';
import { Adapter } from '../../adapter';
import { ArrayExpressionNode } from '../../ast/array-expression-node';
import { ColumnTypeNode } from '../../ast/column-type-node';
import { IdentifierNode } from '../../ast/identifier-node';
import { ObjectExpressionNode } from '../../ast/object-expression-node';
import { PropertyNode } from '../../ast/property-node';
import { UnionExpressionNode } from '../../ast/union-expression-node';
import {
  JSON_ARRAY_DEFINITION,
  JSON_OBJECT_DEFINITION,
  JSON_PRIMITIVE_DEFINITION,
  JSON_VALUE_DEFINITION,
} from '../../transformer/definitions';

type MysqlAdapterOptions = {
  dateParser?: DateParser<'date' | 'datetime'>;
  timestampParser?: TimestampParser;
};

export class MysqlAdapter extends Adapter {
  override readonly definitions = {
    Decimal: new ColumnTypeNode(
      new IdentifierNode('string'),
      new UnionExpressionNode([
        new IdentifierNode('string'),
        new IdentifierNode('number'),
      ]),
    ),
    Geometry: new UnionExpressionNode([
      new IdentifierNode('LineString'),
      new IdentifierNode('Point'),
      new IdentifierNode('Polygon'),
      new ArrayExpressionNode(new IdentifierNode('Geometry')),
    ]),
    Json: new ColumnTypeNode(
      new IdentifierNode('JsonValue'),
      new IdentifierNode('string'),
      new IdentifierNode('string'),
    ),
    JsonArray: JSON_ARRAY_DEFINITION,
    JsonObject: JSON_OBJECT_DEFINITION,
    JsonPrimitive: JSON_PRIMITIVE_DEFINITION,
    JsonValue: JSON_VALUE_DEFINITION,
    LineString: new ArrayExpressionNode(new IdentifierNode('Point')),
    Point: new ObjectExpressionNode([
      new PropertyNode('x', new IdentifierNode('number')),
      new PropertyNode('y', new IdentifierNode('number')),
    ]),
    Polygon: new ArrayExpressionNode(new IdentifierNode('LineString')),
  };
  // These types have been found through experimentation in Adminer.
  override readonly scalars = {
    bigint: new IdentifierNode('number'),
    binary: new IdentifierNode('Buffer'),
    bit: new IdentifierNode('Buffer'),
    blob: new IdentifierNode('Buffer'),
    char: new IdentifierNode('string'),
    date: new IdentifierNode('Date'),
    datetime: new IdentifierNode('Date'),
    decimal: new IdentifierNode('Decimal'),
    double: new IdentifierNode('number'),
    float: new IdentifierNode('number'),
    geomcollection: new ArrayExpressionNode(new IdentifierNode('Geometry')), // Specified as "geometrycollection" in Adminer.
    geometry: new IdentifierNode('Geometry'),
    int: new IdentifierNode('number'),
    json: new IdentifierNode('Json'),
    linestring: new IdentifierNode('LineString'),
    longblob: new IdentifierNode('Buffer'),
    longtext: new IdentifierNode('string'),
    mediumblob: new IdentifierNode('Buffer'),
    mediumint: new IdentifierNode('number'),
    mediumtext: new IdentifierNode('string'),
    multilinestring: new ArrayExpressionNode(new IdentifierNode('LineString')),
    multipoint: new ArrayExpressionNode(new IdentifierNode('Point')),
    multipolygon: new ArrayExpressionNode(new IdentifierNode('Polygon')),
    point: new IdentifierNode('Point'),
    polygon: new IdentifierNode('Polygon'),
    set: new IdentifierNode('unknown'),
    smallint: new IdentifierNode('number'),
    text: new IdentifierNode('string'),
    time: new IdentifierNode('string'),
    timestamp: new IdentifierNode('Date'),
    tinyblob: new IdentifierNode('Buffer'),
    tinyint: new IdentifierNode('number'),
    tinytext: new IdentifierNode('string'),
    varbinary: new IdentifierNode('Buffer'),
    varchar: new IdentifierNode('string'),
    year: new IdentifierNode('number'),
  };

  constructor(options?: MysqlAdapterOptions) {
    super();

    if (typeof options?.dateParser === 'string') {
      this.scalars.date = this.#getDateParserKindValue(options.dateParser);
      this.scalars.datetime = this.#getDateParserKindValue(options.dateParser);
    } else if (options?.dateParser !== undefined) {
      this.scalars.date = this.#getDateParserKindValue(options.dateParser.date);
      this.scalars.datetime = this.#getDateParserKindValue(
        options.dateParser.datetime,
      );
    }

    if (typeof options?.timestampParser === 'string') {
      this.scalars.timestamp = this.#getTimestampParserKindValue(
        options.timestampParser,
      );
    } else if (options?.timestampParser !== undefined) {
      this.scalars.timestamp = this.#getTimestampParserKindValue(
        options.timestampParser.timestamp,
      );
    }
  }

  #getDateParserKindValue(
    dateParserKind: DateParserKind | undefined,
  ): IdentifierNode {
    switch (dateParserKind) {
      case DateParserKind.STRING:
        return new IdentifierNode('string');
      default:
        return new IdentifierNode('Date');
    }
  }

  #getTimestampParserKindValue(
    timestampParserKind: TimestampParserKind | undefined,
  ): IdentifierNode {
    switch (timestampParserKind) {
      case TimestampParserKind.STRING:
        return new IdentifierNode('string');
      default:
        return new IdentifierNode('Date');
    }
  }
}

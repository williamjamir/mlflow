import { ComplexDataTypeUtils } from './ComplexDataTypeUtils';

const simpleArray = {
  type: 'array',
  elementType: 'string',
};

const simpleMap = {
  data_type: 'map',
  keyType: 'integer',
  valueType: 'string',
};

describe('ComplexDataTypeUtils', () => {
  it('test parsing non complex data type', () => {
    expect(ComplexDataTypeUtils.parse(null)).toEqual('');
    expect(ComplexDataTypeUtils.parse('')).toEqual('');
    expect(ComplexDataTypeUtils.parse('integer')).toEqual('INTEGER');
    expect(ComplexDataTypeUtils.parse({ data_type: 'float' })).toEqual('FLOAT');
    expect(ComplexDataTypeUtils.parse({ type: 'double' })).toEqual('DOUBLE');
  });

  it('test parsing simple array', () => {
    expect(ComplexDataTypeUtils.parse(simpleArray)).toEqual('ARRAY<STRING>');
  });

  it('test parsing simple map', () => {
    expect(ComplexDataTypeUtils.parse(simpleMap)).toEqual('MAP<INTEGER, STRING>');
  });

  it('test parsing nested array of maps', () => {
    const dataTypeDetails = {
      data_type: 'array',
      elementType: simpleMap,
    };
    expect(ComplexDataTypeUtils.parse(dataTypeDetails)).toEqual('ARRAY<MAP<INTEGER, STRING>>');
  });

  it('test parsing nested map of arrays', () => {
    const dataTypeDetails = {
      type: 'map',
      keyType: 'integer',
      valueType: simpleArray,
    };
    expect(ComplexDataTypeUtils.parse(dataTypeDetails)).toEqual('MAP<INTEGER, ARRAY<STRING>>');
  });

  it('test super nested complex data type', () => {
    const dataTypeDetails = {
      keyType: 'integer',
      data_type: 'map',
      valueType: {
        keyType: 'string',
        type: 'map',
        valueType: {
          elementType: {
            keyType: 'string',
            data_type: 'map',
            valueType: simpleArray,
          },
          type: 'array',
        },
      },
    };
    expect(ComplexDataTypeUtils.parse(dataTypeDetails)).toEqual(
      'MAP<INTEGER, MAP<STRING, ARRAY<MAP<STRING, ARRAY<STRING>>>>>',
    );
  });
});

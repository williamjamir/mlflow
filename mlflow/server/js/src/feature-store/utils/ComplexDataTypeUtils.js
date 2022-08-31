import { ComplexDataTypes } from '../constants';

export class ComplexDataTypeUtils {
  static complexDataTypeParserMapper = {
    [ComplexDataTypes.ARRAY]: ComplexDataTypeUtils.parseArrayType,
    [ComplexDataTypes.MAP]: ComplexDataTypeUtils.parseMapType,
  };

  // Recursively construct complex data type string
  // parse() => parseArrayType()/parseMapType()/... => parse() => ...
  static parse(dataTypeDetails) {
    if (!dataTypeDetails) {
      return '';
    }
    if (!dataTypeDetails.data_type && !dataTypeDetails.type) {
      if (typeof dataTypeDetails === 'string') {
        return dataTypeDetails.toUpperCase();
      }
      return '';
    }
    const dataType = (dataTypeDetails.data_type || dataTypeDetails.type).toUpperCase();
    if (!(dataType in ComplexDataTypeUtils.complexDataTypeParserMapper)) {
      return dataType;
    }
    // delegate to the specific complex data type parser
    const dataTypeParser = ComplexDataTypeUtils.complexDataTypeParserMapper[dataType];
    return dataTypeParser(dataTypeDetails).toUpperCase();
  }

  static parseArrayType(dataTypeDetails) {
    if (!dataTypeDetails || !dataTypeDetails.elementType) {
      return ComplexDataTypes.ARRAY;
    }
    // recursively parse array element type
    const elementType = ComplexDataTypeUtils.parse(dataTypeDetails.elementType);
    const parsedArrayType = `${ComplexDataTypes.ARRAY}<${elementType}>`;
    return parsedArrayType.toUpperCase();
  }

  static parseMapType(dataTypeDetails) {
    if (!dataTypeDetails || !dataTypeDetails.valueType || !dataTypeDetails.keyType) {
      return ComplexDataTypes.MAP;
    }
    // recursively parse map key and value type
    const keyType = ComplexDataTypeUtils.parse(dataTypeDetails.keyType);
    const valueType = ComplexDataTypeUtils.parse(dataTypeDetails.valueType);
    const parsedMapType = `${ComplexDataTypes.MAP}<${keyType}, ${valueType}>`;
    return parsedMapType.toUpperCase();
  }
}

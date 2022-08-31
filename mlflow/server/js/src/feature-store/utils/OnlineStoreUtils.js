class OnlineStoreUtils {
  static getDynamoDbRegion = (onlineStore) => onlineStore?.dynamodb_metadata?.region || '-';
}

export default OnlineStoreUtils;

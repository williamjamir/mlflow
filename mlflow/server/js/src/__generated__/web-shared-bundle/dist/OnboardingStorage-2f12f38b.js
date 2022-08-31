import _truncate from 'lodash/truncate';
import { R as RandomUtils } from './RandomUtils-95541717.js';
import _defineProperty from '@babel/runtime/helpers/defineProperty';

const browserTabId = RandomUtils.generateUUID();
let browserUtilsConfigCache;
function setBrowserUtilsConfig(config) {
  browserUtilsConfigCache = config;
}
function getMeasurementTags(additionalTags) {
  var _browserUtilsConfigCa;

  const defaultTags = {
    browserTabId,
    browserHasFocus: document.hasFocus(),
    browserIsHidden: document.hidden,
    // Keep path truncated to at most UsageLogging.MAX_TAG_LENGTH (see UsageLogging.scala)
    // To stay compatible with workspace exception naming this is called browserHash
    browserHash: _truncate(window.location.pathname, {
      length: 200,
      omission: '[TRUNCATED]'
    }),
    browserHostName: window.location.hostname,
    browserUserAgent: navigator.userAgent,
    eventWindowTime: window.performance.now(),
    clientBranchName: (_browserUtilsConfigCa = browserUtilsConfigCache) === null || _browserUtilsConfigCa === void 0 ? void 0 : _browserUtilsConfigCa.branch
  };
  return { ...defaultTags,
    ...additionalTags
  };
}

let ByteUnit;

(function (ByteUnit) {
  ByteUnit["Bytes"] = "Bytes";
  ByteUnit["KiloBytes"] = "KiloBytes";
  ByteUnit["MegaBytes"] = "MegaBytes";
  ByteUnit["GigaBytes"] = "GigaBytes";
  ByteUnit["TeraBytes"] = "TeraBytes";
  ByteUnit["PetaBytes"] = "PetaBytes";
  ByteUnit["ExaBytes"] = "ExaBytes";
  ByteUnit["ZettaBytes"] = "ZettaBytes";
  ByteUnit["YottaBytes"] = "YottaBytes";
})(ByteUnit || (ByteUnit = {}));

const byteExponentsMap = {
  [ByteUnit.Bytes]: 0,
  [ByteUnit.KiloBytes]: 1,
  [ByteUnit.MegaBytes]: 2,
  [ByteUnit.GigaBytes]: 3,
  [ByteUnit.TeraBytes]: 4,
  [ByteUnit.PetaBytes]: 5,
  [ByteUnit.ExaBytes]: 6,
  [ByteUnit.ZettaBytes]: 7,
  [ByteUnit.YottaBytes]: 8
};
const sizes = [ByteUnit.Bytes, ByteUnit.KiloBytes, ByteUnit.MegaBytes, ByteUnit.GigaBytes, ByteUnit.TeraBytes, ByteUnit.PetaBytes, ByteUnit.ExaBytes, ByteUnit.ZettaBytes, ByteUnit.YottaBytes];
function humanReadableBytes(size) {
  let unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ByteUnit.Bytes;

  // don't parse negative numbers;
  if (size < 0) {
    return {
      size,
      sizeUnit: unit
    };
  } // convert to bytes first


  const bytes = size * Math.pow(1024, byteExponentsMap[unit]); // find the new nearest exponent

  let exponent = Math.floor(Math.log(bytes) / Math.log(1024)); // clamp i between 0 (bytes) and sizes.length - 1 (max supported unit)

  exponent = Math.min(Math.max(exponent, 0), sizes.length - 1); // then find the appropriate unit

  const numBytes = bytes / Math.pow(1024, exponent);
  const sizeUnit = sizes[exponent];
  return {
    size: numBytes,
    sizeUnit
  };
}

const DEFAULT_SERIALIZER = _ref => {
  let {
    item,
    version
  } = _ref;
  return JSON.stringify(item);
};

const DEFAULT_DESERIALIZER = _ref2 => {
  let {
    item,
    version
  } = _ref2;
  return JSON.parse(item);
};

function createStorageMap(_ref3) {
  let {
    version,
    prefix,
    serializer = DEFAULT_SERIALIZER,
    deserializer = DEFAULT_DESERIALIZER,
    storage = window.localStorage
  } = _ref3;

  const createKey = key => "".concat(prefix).concat(key);
  /**
   * There are two layers of serialization. We let the consumer perform their
   * custom serialization, and then we serialize that further so we can control
   * the version / base structure.
   */


  const serialize = _ref4 => {
    let {
      item,
      version
    } = _ref4;
    const serializedItem = serializer({
      item,
      version
    });
    return JSON.stringify({
      item: serializedItem,
      version
    });
  };
  /**
   * There are two layers of deserialization: reconstituting our internal
   * structure, and then reconstituting the consumer's.
   */


  const deserialize = _ref5 => {
    let {
      storedItem
    } = _ref5;
    const {
      item,
      version
    } = JSON.parse(storedItem);
    return deserializer({
      item,
      version
    });
  };

  return {
    [Symbol.iterator]: function () {
      const entries = this.entries();
      let index = 0;
      return {
        [Symbol.iterator]: function () {
          return this;
        },
        next: () => {
          const value = entries[index++];
          const done = index > entries.length;
          return {
            value,
            done
          };
        }
      };
    },

    get size() {
      return this.entries().length;
    },

    entries() {
      return Object.entries(storage).filter(_ref6 => {
        let [key] = _ref6;
        return key.startsWith(prefix);
      }).map(_ref7 => {
        let [key, value] = _ref7;
        return [key.slice(prefix.length), deserialize({
          storedItem: value
        })];
      });
    },

    keys() {
      return this.entries().map(_ref8 => {
        let [key] = _ref8;
        return key;
      });
    },

    values() {
      return this.entries().map(_ref9 => {
        let [, value] = _ref9;
        return value;
      });
    },

    forEach(callbackFn, thisArg) {
      const entries = this.entries();
      const boundCallback = callbackFn.bind(thisArg);

      for (const [key, value] of entries) {
        boundCallback(value, key, this);
      }
    },

    clear() {
      const keys = this.keys();

      for (const key of keys) {
        this.delete(key);
      }
    },

    get(key) {
      const storedItem = storage.getItem(createKey(key));
      if (!storedItem) return undefined;
      return deserialize({
        storedItem
      });
    },

    delete(key) {
      storage.removeItem(createKey(key));
    },

    set(key, value) {
      try {
        storage.setItem(createKey(key), serialize({
          item: value,
          version
        }));
      } catch (error) {
        // Log if quota is exceeded
        console.error(error);
      }
    },

    has(key) {
      return createKey(key) in storage;
    }

  };
}

class OnboardingStorage {
  constructor(orgId, userId) {
    _defineProperty(this, "storageMap", createStorageMap({
      version: 1,
      prefix: "onboarding-user_".concat(this.userId, "-org_").concat(this.orgId, "-")
    }));

    this.orgId = orgId;
    this.userId = userId;
  }

  get isVisible() {
    return this.storageMap.get('visible');
  }

  set isVisible(value) {
    this.storageMap.set('visible', value !== null && value !== void 0 ? value : false);
  }

  get hasSkipped() {
    var _this$storageMap$get;

    return (_this$storageMap$get = this.storageMap.get('hasSkipped')) !== null && _this$storageMap$get !== void 0 ? _this$storageMap$get : false;
  }

  set hasSkipped(value) {
    this.storageMap.set('hasSkipped', value);
  }

  getOnboardingCheck(check) {
    return this.storageMap.get("check-".concat(check));
  }

  setOnboardingCheck(check, value) {
    this.storageMap.set("check-".concat(check), value);
  }

}

export { ByteUnit as B, OnboardingStorage as O, createStorageMap as c, getMeasurementTags as g, humanReadableBytes as h, setBrowserUtilsConfig as s };
//# sourceMappingURL=OnboardingStorage-2f12f38b.js.map

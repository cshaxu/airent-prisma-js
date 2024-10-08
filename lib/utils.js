"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.omit = exports.entityCompare = exports.compare = exports.buildWhere = exports.batchLoadTopMany = exports.batchLoad = void 0;
var consts_1 = require("./consts");
function batchLoad(loader_1, keys_1) {
    return __awaiter(this, arguments, void 0, function (loader, keys, batchSize, topSize) {
        var result, where, offset, batch, take, query;
        if (batchSize === void 0) { batchSize = consts_1.DEFAULT_BATCH_SIZE; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (keys.length === 0) {
                        return [2 /*return*/, []];
                    }
                    result = [];
                    where = buildWhere(keys);
                    offset = 0;
                    batch = [];
                    take = topSize === undefined ? batchSize : Math.min(batchSize, topSize);
                    _a.label = 1;
                case 1:
                    query = { where: where, skip: offset, take: take };
                    return [4 /*yield*/, loader(query)];
                case 2:
                    batch = _a.sent();
                    if (topSize === undefined || result.length + batch.length <= topSize) {
                        result.push.apply(result, batch);
                    }
                    else {
                        if (result.length < topSize) {
                            result.push.apply(result, batch.slice(0, topSize - result.length));
                        }
                        return [3 /*break*/, 4];
                    }
                    offset += batch.length;
                    _a.label = 3;
                case 3:
                    if (batch.length === batchSize) return [3 /*break*/, 1];
                    _a.label = 4;
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
exports.batchLoad = batchLoad;
function batchLoadTopMany(loader_1, matcher_1, keys_1, topSize_1) {
    return __awaiter(this, arguments, void 0, function (loader, matcher, keys, topSize, batchSize) {
        var result, _a, OR, otherConditions, counter, remainingKeys, batch, offset, query, nextRemainingKeys, _i, batch_1, entity, _b, remainingKeys_1, key, count_1, count;
        var _c, _d;
        if (batchSize === void 0) { batchSize = consts_1.DEFAULT_BATCH_SIZE; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    result = [];
                    if (keys.length === 0) {
                        return [2 /*return*/, result];
                    }
                    _a = buildWhere(keys, false), OR = _a.OR, otherConditions = __rest(_a, ["OR"]);
                    counter = new Map();
                    if (!(OR === undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, batchLoad(loader, keys, batchSize, topSize)];
                case 1: return [2 /*return*/, _e.sent()];
                case 2:
                    remainingKeys = OR;
                    batch = [];
                    _e.label = 3;
                case 3:
                    offset = remainingKeys.reduce(function (count, key) { var _a; return count + ((_a = counter.get(key)) !== null && _a !== void 0 ? _a : 0); }, 0);
                    query = {
                        where: __assign({ OR: remainingKeys }, otherConditions),
                        skip: offset,
                        take: batchSize,
                    };
                    return [4 /*yield*/, loader(query)];
                case 4:
                    batch = _e.sent();
                    nextRemainingKeys = [];
                    for (_i = 0, batch_1 = batch; _i < batch_1.length; _i++) {
                        entity = batch_1[_i];
                        for (_b = 0, remainingKeys_1 = remainingKeys; _b < remainingKeys_1.length; _b++) {
                            key = remainingKeys_1[_b];
                            if (matcher(key, entity)) {
                                count_1 = (_c = counter.get(key)) !== null && _c !== void 0 ? _c : 0;
                                if (count_1 < topSize) {
                                    result.push(entity);
                                    counter.set(key, count_1 + 1);
                                    break;
                                }
                            }
                            count = (_d = counter.get(key)) !== null && _d !== void 0 ? _d : 0;
                            if (count < topSize) {
                                nextRemainingKeys.push(key);
                            }
                        }
                    }
                    remainingKeys = nextRemainingKeys;
                    _e.label = 5;
                case 5:
                    if (remainingKeys.length > 0 && batch.length === batchSize) return [3 /*break*/, 3];
                    _e.label = 6;
                case 6: return [2 /*return*/, result];
            }
        });
    });
}
exports.batchLoadTopMany = batchLoadTopMany;
function buildWhere(loadKeys, allowIn) {
    if (allowIn === void 0) { allowIn = true; }
    if (loadKeys.length === 0) {
        return {};
    }
    var map = loadKeys.reduce(function (acc, loadKey) {
        Object.entries(loadKey).forEach(function (entry) {
            var _a;
            var array = (_a = acc[entry[0]]) !== null && _a !== void 0 ? _a : [];
            if (!array.some(function (value) { return compare(value, entry[1]); })) {
                array.push(entry[1]);
            }
            acc[entry[0]] = array;
        });
        return acc;
    }, {});
    var allKeys = Object.keys(map);
    var singleKeys = Object.entries(map)
        .filter(function (entry) { return entry[1].length === 1; })
        .map(function (entry) { return entry[0]; });
    var singleKeySet = new Set(singleKeys);
    var multiKeys = allKeys.filter(function (key) { return !singleKeySet.has(key); });
    var where = Object.entries(loadKeys[0])
        .filter(function (entry) { return singleKeySet.has(entry[0]); })
        .reduce(function (acc, entry) {
        acc[entry[0]] = entry[1];
        return acc;
    }, {});
    if (multiKeys.length === 0) {
        return where;
    }
    if (allowIn && multiKeys.length === 1) {
        var onlyMultiKey = multiKeys[0];
        var values = map[onlyMultiKey];
        if (!["function", "object"].includes(typeof values[0])) {
            where[onlyMultiKey] = { in: values };
            return where;
        }
    }
    where["OR"] = loadKeys.map(function (loadKey) { return omit(loadKey, singleKeys); });
    return where;
}
exports.buildWhere = buildWhere;
function entityCompare(original, updated, fields) {
    return fields.filter(function (field) {
        var value1 = original[field];
        var value2 = updated[field];
        return !compare(value1, value2);
    });
}
exports.entityCompare = entityCompare;
function compare(a, b) {
    // same value/reference
    if (a === b) {
        return true;
    }
    var typeA = typeof a;
    var typeB = typeof b;
    // different type
    if (typeA !== typeB) {
        return false;
    }
    // same non-object type but differen value
    if (typeA !== "object") {
        return false;
    }
    // same objects but different reference, value could be same though
    return JSON.stringify(a) === JSON.stringify(b);
}
exports.compare = compare;
function omit(object, keys) {
    keys = (typeof keys === "string" ? [keys] : keys);
    return Object.keys(object)
        .map(function (key) { return key; })
        .filter(function (key) { return !keys.includes(key); })
        .reduce(function (acc, key) {
        acc[key] = object[key];
        return acc;
    }, {});
}
exports.omit = omit;
//# sourceMappingURL=utils.js.map
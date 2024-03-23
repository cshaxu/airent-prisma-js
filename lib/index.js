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
exports.buildWhere = exports.batchLoadTopMany = exports.batchLoad = void 0;
var lodash_1 = require("lodash");
var DEFAULT_BATCH_SIZE = 1000;
function batchLoad(loader, keys, batchSize) {
    if (batchSize === void 0) { batchSize = DEFAULT_BATCH_SIZE; }
    return __awaiter(this, void 0, void 0, function () {
        var result, where, offset, batch, query;
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
                    _a.label = 1;
                case 1:
                    query = { where: where, skip: offset, take: batchSize };
                    return [4 /*yield*/, loader(query)];
                case 2:
                    batch = _a.sent();
                    result.push.apply(result, batch);
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
function batchLoadTopMany(loader, matcher, keys, topSize, batchSize) {
    var _a, _b;
    if (batchSize === void 0) { batchSize = DEFAULT_BATCH_SIZE; }
    return __awaiter(this, void 0, void 0, function () {
        var result, _c, OR, otherConditions, counter, remainingKeys, batch, offset, query, nextRemainingKeys, _i, batch_1, entity, _d, remainingKeys_1, key, count_1, count;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    result = [];
                    if (keys.length === 0) {
                        return [2 /*return*/, result];
                    }
                    _c = buildWhere(keys, false), OR = _c.OR, otherConditions = __rest(_c, ["OR"]);
                    counter = new Map();
                    remainingKeys = OR !== null && OR !== void 0 ? OR : [{}];
                    batch = [];
                    _e.label = 1;
                case 1:
                    offset = remainingKeys.reduce(function (count, key) { var _a; return count + ((_a = counter.get(key)) !== null && _a !== void 0 ? _a : 0); }, 0);
                    query = {
                        where: __assign({ OR: remainingKeys }, otherConditions),
                        skip: offset,
                        take: batchSize,
                    };
                    return [4 /*yield*/, loader(query)];
                case 2:
                    batch = _e.sent();
                    nextRemainingKeys = [];
                    for (_i = 0, batch_1 = batch; _i < batch_1.length; _i++) {
                        entity = batch_1[_i];
                        for (_d = 0, remainingKeys_1 = remainingKeys; _d < remainingKeys_1.length; _d++) {
                            key = remainingKeys_1[_d];
                            if (matcher(key, entity)) {
                                count_1 = (_a = counter.get(key)) !== null && _a !== void 0 ? _a : 0;
                                if (count_1 < topSize) {
                                    result.push(entity);
                                    counter.set(key, count_1 + 1);
                                    break;
                                }
                            }
                            count = (_b = counter.get(key)) !== null && _b !== void 0 ? _b : 0;
                            if (count < topSize) {
                                nextRemainingKeys.push(key);
                            }
                        }
                    }
                    remainingKeys = nextRemainingKeys;
                    _e.label = 3;
                case 3:
                    if (remainingKeys.length > 0 && batch.length === batchSize) return [3 /*break*/, 1];
                    _e.label = 4;
                case 4: return [2 /*return*/, result];
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
            array.push(entry[1]);
            acc[entry[0]] = array;
        });
        return acc;
    }, {});
    var allKeys = Object.keys(map);
    var singleKeys = Object.entries(map)
        .filter(function (entry) { return new Set(entry[1]).size === 1; })
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
    where["OR"] = loadKeys.map(function (loadKey) { return (0, lodash_1.omit)(loadKey, singleKeys); });
    return where;
}
exports.buildWhere = buildWhere;
//# sourceMappingURL=index.js.map
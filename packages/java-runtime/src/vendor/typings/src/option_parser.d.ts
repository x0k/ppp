export declare const enum ParseType {
    FLAG = 0,
    COLON_VALUE_SYNTAX = 1,
    COLON_VALUE_OR_FLAG_SYNTAX = 2,
    NORMAL_VALUE_SYNTAX = 3,
    MAP_SYNTAX = 4,
}
export interface Description {
    [prefix: string]: DescriptionCategory;
}
export interface DescriptionCategory {
    [optionName: string]: Option;
}
export interface Option {
    desc?: string;
    type?: ParseType;
    optDesc?: string;
    alias?: string;
    stopParsing?: boolean;
    enabled?: boolean;
    prefix?: string;
    name?: string;
}
export interface RawPrefixParseResult {
    [optionName: string]: boolean | string | {
        [name: string]: string;
    };
}
export declare class PrefixParseResult {
    private _result;
    private _unparsedArgs;
    constructor(result: RawPrefixParseResult, unparsedArgs?: string[]);
    unparsedArgs(): string[];
    flag(name: string, defaultVal: boolean): boolean;
    stringOption(name: string, defaultVal: string): string;
    mapOption(name: string): {
        [name: string]: string;
    };
}
export interface ParseResult {
    [prefix: string]: PrefixParseResult;
}
/**
 * Handles parsing for a specific options configuration.
 * Parses Java-style options.
 */
export declare class OptionParser {
    private _parseMap;
    private _prefixes;
    private _mapArgs;
    private _rawDesc;
    constructor(desc: Description);
    /**
     * Parses the given arguments. Throws an exception on parsing failure.
     */
    parse(argv: string[]): ParseResult;
    /**
     * Generates help text for the given prefixed options.
     */
    help(prefix: string): string;
}

export type DocumentCode = string;
export type DocumentName = string;
export type FormattedDocumentName = string;

export const VALID_DOCUMENT_CODE_REGEX: RegExp = /D\d+_C\d+/i;
export const VALID_DOCUMENT_NAME_REGEX: RegExp = /D\d+_C\d+_.*\.rs3$/i;
export const VALID_FORMATTED_DOCUMENT_NAME_REGEX: RegExp = /^D\d+_C\d+.*\.txt$/i;

export function isValidDocumentCode(code: string): code is DocumentCode {
    return VALID_DOCUMENT_CODE_REGEX.test(code);
}
export function isValidDocumentName(name: string): name is DocumentName {
    return VALID_DOCUMENT_NAME_REGEX.test(name);
}
export function isValidFormattedDocumentName(name: string): name is FormattedDocumentName {
    return VALID_FORMATTED_DOCUMENT_NAME_REGEX.test(name);
}

export function getDocumentCodeFromName(name: DocumentName): DocumentCode {
    const match = name.match(VALID_DOCUMENT_CODE_REGEX);
    if (isValidDocumentName(name) && match) {
        return match[0];
    }
    throw new Error(`Invalid document name: ${name}`);
}
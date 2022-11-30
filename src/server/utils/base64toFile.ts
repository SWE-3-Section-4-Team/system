const BASE64_DIVIDER = /^data:([A-Za-z-+\/]+);base64,(.+)$/;
const TYPE_FROM_BASE64_HEADER = /\/(.*?)$/;

const parseBase64File = (base64: string) => {
    const matches = base64.match(BASE64_DIVIDER);

    if (!matches) {
        return null;
    }

    if (matches.length !== 3) {
        return null;
    }

    const type =  matches[1];
    const data = matches[2];

    if (!type || !data) {
        return null;
    }

    return {
        type,
        data: Buffer.from(data, 'base64'),
    };
};

export const parseFile = (base64: string) => {
    const file = parseBase64File(base64);

    if (!file) {
        return null;
    }

    const extension = file.type.match(TYPE_FROM_BASE64_HEADER)?.[1];

    if (!extension) {
        return null;
    }

    return {
        extension,
        type: file.type,
        data: file.data,
    }
};

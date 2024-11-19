import crypto from 'crypto';

const generateHash = (...args) => {
    return crypto
        .createHash('sha-256')
        .update(
            args
                .map((arg) => JSON.stringify(arg))
                .sort()
                .join('')
        )
        .digest('hex')
}

export default generateHash;
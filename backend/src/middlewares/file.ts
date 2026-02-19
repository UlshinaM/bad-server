import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { join } from 'path'
import md5 from 'md5'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        cb(
            null,
            join(
                __dirname,
                process.env.UPLOAD_PATH_TEMP
                    ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                    : '../public'
            )
        )
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const hashFile = md5(file.originalname + Date.now());
        const onlyExtension = file.originalname.split('.').pop()
        cb(null, `${hashFile}.${onlyExtension}`)
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const signatures: Record<string, string[]> = {
    'image/png': ['89504E47'],
    'image/jpg': ['FFD8FF'],
    'image/jpeg': ['FFD8FF'],
    'image/gif': ['47494638'],
    'image/svg+xml': ['3C3F3F3F'],
}; 

const checkFileContent = (mimeType: string, buffer: Buffer): boolean => {
    const imageSignatures = signatures[mimeType];
    console.log(imageSignatures);

    if (!imageSignatures) {
        return false
    }

    const maxCheckBytes = 100;
    const hexImageBytes = buffer.subarray(0, maxCheckBytes).toString('hex').toUpperCase();
    console.log(hexImageBytes);

    return imageSignatures.some((sign) => hexImageBytes.startsWith(sign))
};

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(null, false)
    }

    if(!checkFileContent(file.mimetype, file.buffer)) {
        return cb(null, false)
    }

    return cb(null, true)
}

export default multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 *1024 } })

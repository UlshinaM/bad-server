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
        const onlyFilename = file.originalname.split('.')[0]
        cb(null, `${hashFile}.${onlyFilename}`)
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const checkFileContent = (mimeType: string, buffer: Buffer): boolean => {
    if (buffer.length < 8) return false

    switch (mimeType) {
        case 'image/png': 
            return (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 && buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A)
        
        case 'image/jpg':
        case 'image/jpeg':
            return (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF)

        case 'image/gif':
            return (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 && (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61)

        case 'image/svg+xml': {
            const str = buffer.toString('utf-8', 0, 5).toLowerCase();    
            return (str.startsWith('<svg') || str.startsWith('<?xml'))
        }   

        default:
            return false
    }
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

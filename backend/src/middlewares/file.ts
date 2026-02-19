import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { join } from 'path'
import md5 from 'md5'
// import { fileTypeFromBuffer } from 'file-type'


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

/* const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
] */

/* const checkFileContent = async (mimeType: string, buffer: Buffer): Promise<boolean> => {
    try {
        const neededBuffer = new Uint8Array(buffer);
        
        const bufferImageType = await fileTypeFromBuffer(neededBuffer);

        if (!bufferImageType) {
            return false
        }

        if (bufferImageType.mime !== mimeType) {
            return false
        }

        return true
    } catch (error) {
        return false
    }
}; */

const fileFilter = async (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    /* if (!types.includes(file.mimetype)) {
        return cb(null, false)
    } */

    /* const isMimeTypeCorrect = await checkFileContent(file.mimetype, file.buffer);

    if(!isMimeTypeCorrect) {
        return cb(null, false)
    } */
    if (!file.buffer) {
        return cb(null, false)
    }

    return cb(null, true)
}

export default multer({
    storage, 
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {fileFilter(req, file, cb).catch((err) => cb(err))}, 
    limits: { fileSize: 10 * 1024 *1024 }
})

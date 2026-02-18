import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { join, extname } from 'path'
import md5 from 'md5'
import sharp from 'sharp'

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
        const onlyFilename = extname(file.originalname).toLowerCase()
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

const fileFilter = async (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    try {
        if (!types.includes(file.mimetype)) {
            return cb(null, false)
        }

        try {
            await sharp(file.buffer).metadata()
            return cb(null, true)
        } catch (error) {
            return cb(null, false)
        }

        // return cb(null, true)
    } catch (error) {
        return cb(null, false)
    }
}

export default multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 *1024 } })

import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import fs from 'fs'
import { fileTypeFromBuffer } from 'file-type'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    if (req.file.size < (2 *1024)) {
        return next(new BadRequestError('Файл не может весить меньше 2Кб'))
    }

    try {
        const buffer = fs.readFileSync(req.file.path);
        const neededBuffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length)
        const fileMimeType = await fileTypeFromBuffer(neededBuffer);

        if (fileMimeType?.mime !== req.file.mimetype) {
            fs.unlinkSync(req.file.path)
            return next(new BadRequestError('Некорректный тип файла'))
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}

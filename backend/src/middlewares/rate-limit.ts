import rateLimit from "express-rate-limit";

const limit = 30;
const msWindow = 60 * 1000;

export const apiRateLimit = rateLimit({
    windowMs: msWindow,
    max: limit,
    message: 'Сервер устал, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            error: 'Слишком много запросов',
            message: 'Сервер устал, попробуйте позже'
        })
    }
});

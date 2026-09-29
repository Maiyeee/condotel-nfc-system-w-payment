import { HttpError } from '../utils/HttpError.js'

export function notFound(req, _res, next) {
  next(
    new HttpError(
      404,
      'ROUTE_NOT_FOUND',
      `No route matches ${req.method} ${req.originalUrl}.`
    )
  )
}

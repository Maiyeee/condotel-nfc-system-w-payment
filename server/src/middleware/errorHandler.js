import { HttpError } from '../utils/HttpError.js'

function mapSqliteError(error) {
  if (!error?.code?.startsWith?.('SQLITE_')) return null

  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return new HttpError(
      409,
      'FOREIGN_KEY_CONFLICT',
      'The requested change references a missing record or a record that is still in use.'
    )
  }

  if (
    error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
    error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY'
  ) {
    return new HttpError(
      409,
      'DUPLICATE_RECORD',
      'A record with the same unique value already exists.'
    )
  }

  if (error.code.startsWith('SQLITE_CONSTRAINT')) {
    return new HttpError(
      400,
      'DATABASE_CONSTRAINT',
      'The request violates a database rule.'
    )
  }

  return new HttpError(
    500,
    'DATABASE_ERROR',
    'The database could not complete the request.'
  )
}

export function errorHandler(error, req, res, _next) {
  const known =
    error instanceof HttpError
      ? error
      : mapSqliteError(error) ||
        new HttpError(500, 'INTERNAL_ERROR', 'The server could not complete the request.')

  if (known.status >= 500) console.error(`[${req.requestId}]`, error)

  res.status(known.status).json({
    error: {
      code: known.code,
      message: known.message,
      details: known.details,
      requestId: req.requestId
    }
  })
}

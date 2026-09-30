export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false
      return true
    })
  )
}

export function getApiErrorMessage(error, fallback = 'The request could not be completed.') {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  )
}

export function getApiErrorCode(error) {
  return error?.response?.data?.error?.code || null
}

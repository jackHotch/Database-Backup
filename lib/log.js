const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 }

const minLevel = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info

const output = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
}

// Turns Error objects into plain data; JSON.stringify(err) would otherwise give {}
function serialize(value) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack, ...value }
  }
  return value
}

function write(level, module, message, data) {
  if (LEVELS[level] < minLevel) return

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    ...(data !== undefined && { data: serialize(data) }),
  }

  output[level](JSON.stringify(entry))
}

/**
 * Creates a logger tagged with a module name.
 *
 * @example
 * const log = createLogger('s3')
 * log.info('Upload started', { key })
 * log.error('Upload failed', err)
 */
export function createLogger(module) {
  return {
    debug: (message, data) => write('debug', module, message, data),
    info: (message, data) => write('info', module, message, data),
    warn: (message, data) => write('warn', module, message, data),
    error: (message, data) => write('error', module, message, data),
  }
}

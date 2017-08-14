'use strict'

function loadEnv() {
  return require('./chunky.json')
}

function loadConfig() {
  return require('./chunky.json')
}

function loadSecureConfig() {
  return require('./.chunky.json')
}

function loadInfo() {
  const parts = process.env.AWS_LAMBDA_FUNCTION_NAME.split("-")
  if (!parts || parts.length !== 3) {
    return 
  }

  return {
    service: parts[0],
    env: parts[1],
    function: parts[2]
  }
}

function loadChunk() {
  const chunk = require('./chunk.json')
 
   if (!chunk || !chunk.service) {
    throw new Error("Missing chunk manifest")
  }

  return chunk 
}

function loadRequiredFields(chunk) {
  const info = loadInfo()

  if (!info || !info.function || !chunk || !chunk.service || 
      !chunk.service.requiredFields || !chunk.service.requiredFields[info.function]) {
    return []
  }

  return chunk.service.requiredFields[info.function]
}

function loadEnv() {
    return (process.env.CHUNKY_ENV || 'dev')
}

function loadSecureCloudConfig() {
    return loadSecureConfig().cloud[loadEnv()]
}

module.exports = {
  loadEnv,
  loadInfo,
  loadChunk,
  loadConfig,
  loadSecureConfig,
  loadRequiredFields,
  loadSecureCloudConfig,
  loadSecureFirebaseConfig
}

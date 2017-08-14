'use strict'

const loader = require('./loader')
const firebase = require('../firebase')

function validate(event, chunk) {
  // Look up the required fields for this function
  const fields = requiredFields(chunk)

  fields.forEach(req => {
    if (!event.body[req]) {
      throw new Error(`${req} field required`)
    }      
  })
}

function done(callback, logs) {
  callback(null, { logs })
}

function doneWithError(callback, error) {
  callback(error)
}

function handleAsyncEvent(event) {
  // Look up the service chunk
  const chunk = loadChunk()

  // Validate the event first
  validate(event, chunk)

  // Look up the post id
  const postId = event.body.id

  // Look up the site
  const idPrefix = "main"

  // Keep track of the content
  const content = event.body.content

  // Remove the content from the main data to be saved
  delete event.body.content

  // Prepare the path and data to save
  const data = Object.assign({}, event.body)
  const path = `posts/${idPrefix}_${postId}`

  // Load the Firebase configuration
  const firebaseConfig = loader.loadSecureFirebaseConfig()

  // Initialize Firebase if necessary
  firebase.initialize(firebaseConfig)

  // Setup a log chain
  const logs = [`Getting ready to save to firebase`]

  // Save this post to the Firebase Database
  return firebase.save([{ path, data }], logs)
}

function onEvent(event, context, callback) {
  try {
    // Make sure we wait until the event is processed
    context.callbackWaitsForEmptyEventLoop = false;    

    // Handle the event
    handleAsyncEvent(event).

    // The event finished successfully
    then(logs => done(callback, logs)).

    // The event finished with an error
    catch(error => { throw error })
  } catch (e) {
    // Something failed, either at validation,
    // before the handler could complete or during execution
    doneWithError(callback, e)
  }
}

module.exports = {
  done,
  onEvent,
  validate,
  doneWithError,
  handleAsyncEvent
}
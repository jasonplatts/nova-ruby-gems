'use strict'

/*
  Generic functions used in the extension are kept in this file.
  Some functions rely on the Nova API.
*/

/*
  Returns a boolean representing whether or not the current
  environment is a workspace or Nova window without a
  workspace.
*/
exports.isWorkspace = function isWorkspace() {
  if (nova.workspace.path == undefined || nova.workspace.path == null) {
    // Opening single file in a Nova editor does not define a workspace. A project must exist.
    // Opening a remote server environment is also not considered a workspace.
    return false
  } else {
    // A local project is the only environment considered a Nova workspace.
    return true
  }
}

/*
  Removes the preceding Volumes and HDD portion of a standard returned path.
*/
exports.normalizePath = function normalizePath(path) {
  // The first element returned from split is anything before the first separator.
  // This will be empty string if nothing is before the first separator.
  let firstDirectory = path.split('/', 2)[1]

  if (firstDirectory == 'Volumes') {
    let newPath = '/' + path.split('/').slice(3).join('/')
    return newPath
  } else {
    return path
  }
}

/*
  Format extension errors in the console.
*/
exports.showConsoleError = function showConsoleError(error) {
  let prefix = 'Ruby Gems Extension --'
  console.error(prefix, error)
}

exports.showNotification = function showNotification(title, body) {
  let notification = new NotificationRequest('todo-notification')

  notification.title   = title
  notification.body    = body
  notification.actions = [nova.localize('OK')]

  nova.notifications.add(notification)
}

/*
  Returns an array that has been stripped of null, blank, and undefined elements.
*/
exports.cleanArray = function cleanArray(array) {
  if (array !== null) {
    array = array.filter(function(element) {
      element = element.trim()

      if (element !== null && element !== '' && element!== undefined) {
        return element
      }
    })

    array = array.map(element => element.trim())
  } else {
    array = []
  }

  return array
}

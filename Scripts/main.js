'use strict'

const FUNCTIONS         = require('./functions.js')
const { Configuration } = require('./configuration.js')
const { DataProvider }  = require('./data_provider.js')
const { List }          = require('./list.js')

var config              = null
var sidebar             = {
  list: null,
  dataProvider: null,
  treeView: null
}

exports.activate = async function() {
  if (nova.inDevMode()) {
    console.clear()
    console.log('RUBY GEMS -- DEVELOPMENT MODE')
  }

  try {
    await registerTreeView()
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
}

async function unRegisterTreeView() {
  // TODO: Add var resets and dispose of disposables.
}

async function registerTreeView() {
  config  = new Configuration()

  let gemNames = await config.loadGemfile()
  sidebar.list = new List(gemNames)

  await sidebar.list.loadItems()

  sidebar.dataProvider = new DataProvider(sidebar.list.items)
  sidebar.treeView = new TreeView('rubygems', {
    dataProvider: sidebar.dataProvider
  })

  nova.subscriptions.add(sidebar.treeView)

  return
}

nova.commands.register('rubygems.openDocs', () => {
  nova.openURL(Configuration.RUBYGEMS_URL)
})

nova.commands.register('rubygems.doubleClick', () => {
  let gemURL = sidebar.treeView.selection[0].url

  if (gemURL !== null) {
    nova.openURL(gemURL)
  }
})


'use strict'

const FUNCTIONS          = require('./functions.js')
const { Configuration }  = require('./configuration.js')
const { DataProvider }   = require('./data_provider.js')
const { List }           = require('./list.js')

var config               = null
var sidebar              = {
  list: null,
  dataProvider: null,
  treeView: null
}
var extensionDisposables = new CompositeDisposable()

exports.activate = async function() {
  if (nova.inDevMode()) {
    console.clear()
    console.log('RUBY GEMS -- DEVELOPMENT MODE')
  }

  try {
    await loadExtension()
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
}

exports.deactivate = function() {
  unloadExtension()
}

async function unloadExtension() {
  config = null
  sidebar.treeView.dispose()
  extensionDisposables.dispose()
  sidebar.list, sidebar.dataProvider, sidebar.treeView = null

  return
}

async function loadExtension() {
  config = new Configuration()

  let gemNames = await config.loadGemfile()
  sidebar.list = new List(gemNames)

  await sidebar.list.loadItems()

  sidebar.dataProvider = new DataProvider(sidebar.list.items)
  sidebar.treeView     = new TreeView('rubygems', {
    dataProvider: sidebar.dataProvider
  })

  extensionDisposables.add(nova.workspace.config.onDidChange('rubygems.workspace.gemfileLocation', reloadExtension))
  nova.subscriptions.add(sidebar.treeView)

  return
}

async function reloadExtension() {
  await unloadExtension()
  await loadExtension()

  sidebar.treeView.refresh()

  return
}

nova.commands.register('rubygems.refresh', () => {
  reloadExtension()
})

nova.commands.register('rubygems.openDocs', () => {
  nova.openURL(Configuration.RUBYGEMS_URL)
})

nova.commands.register('rubygems.doubleClick', () => {
  let gemURL = sidebar.treeView.selection[0].url

  if (gemURL !== null) {
    nova.openURL(gemURL)
  }
})


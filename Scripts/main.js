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

  config  = new Configuration()

  try {
    await registerTreeView()
    // console.log(gemNames)
    // fetchRubyGems(gemNames[0])
  } catch (error) {
    FUNCTIONS.showConsoleError(error)
  }
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
}

async function registerTreeView() {
  let gemNames = await config.loadGemfile()
  sidebar.list = new List(gemNames)

  await sidebar.list.loadItems()

  // Create the TreeView
  sidebar.dataProvider = new DataProvider(sidebar.list.items)
  sidebar.treeView = new TreeView('rubygems', {
    dataProvider: sidebar.dataProvider
  })

  // TreeView implements the Disposable interface
  nova.subscriptions.add(sidebar.treeView)

  return
}

nova.commands.register('mysidebar.doubleClick', () => {
  // Invoked when an item is double-clicked
  let selection = treeView.selection
  console.log('DoubleClick: ' + selection.map((e) => e.name))
})


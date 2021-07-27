'use strict'

const FUNCTIONS    = require('./functions.js')
const { ListItem } = require('./list_item.js')

exports.List = class List {
  constructor(gemNames) {
    this._gemNames = gemNames
    this._items    = []
  }

  async loadItems() {
    if (FUNCTIONS.isWorkspace()) {
      for (const gemName of this._gemNames) {
        let apiGemData = await this.fetchRubyGem(gemName)

        let item       = new ListItem(gemName)

        item.collapsibleState = TreeItemCollapsibleState.Expanded

        let subItem = new ListItem('Latest Version')
        subItem.descriptiveText = apiGemData.version
        item.children.push(subItem)
        item.version = apiGemData.version
        item.versionDownloads = apiGemData.version_downloads
        item.authors = apiGemData.authors

        item.sourceCodeURI = apiGemData.source_code_uri
        item.gemURI = apiGemData.gem_uri

        this._items.push( item )
      }
    }

    return true
  }

  async fetchRubyGem(gemName) {
    return new Promise((resolve, reject) => {
      // try {
      fetch(`https://rubygems.org/api/v1/gems/${gemName}.json`)
        .then(response => response.json())
        .then(data => {
          resolve(data)
        })
      // } catch (error) {
      //   FUNCTIONS.showConsoleError(error)
      //   reject(error)
      // }

    })
  }

  get items() {
    return this._items
  }

  addListItems(items) {
    items.forEach((item) => {
      this.addListItem(item)
    })
  }

  addListItem(item) {
    this._items = [...this._items, item]
  }
}

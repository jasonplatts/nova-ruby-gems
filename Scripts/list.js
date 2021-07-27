'use strict'

const FUNCTIONS    = require('./functions.js')
const { ListItem } = require('./list_item.js')

exports.List = class List {
  constructor(gemNames) {
    this._gemNames = gemNames
    this._items    = []
  }

  /*
    Retrieves information from RubyGems on an array of Gems.
    Then converts that information into list items.
  */
  async loadItems() {
    if (FUNCTIONS.isWorkspace()) {
      for (const gemName of this._gemNames) {
        let apiGemData                          = await this.fetchRubyGem(gemName)

        let item                                = new ListItem(gemName)

        item.collapsibleState                   = TreeItemCollapsibleState.Expanded
        item.image                              = 'sidebar-list-item'

        let subItemInfo                         = new ListItem('Info')
        subItemInfo.descriptiveText             = apiGemData.info
        subItemInfo.image                       = 'sidebar-list-sub-item'
        item.children.push(subItemInfo)

        let subItemAuthors                      = new ListItem('Authors')
        subItemAuthors.descriptiveText          = apiGemData.authors
        subItemAuthors.image                    = 'sidebar-list-sub-item'
        item.children.push(subItemAuthors)

        let subItemVersion                      = new ListItem('Latest Version')
        subItemVersion.descriptiveText          = apiGemData.version
        subItemVersion.image                    = 'sidebar-list-sub-item'
        item.children.push(subItemVersion)

        let subItemVersionDownloads             = new ListItem('Version Downloads')
        subItemVersionDownloads.descriptiveText = apiGemData.version_downloads.toLocaleString('en-US')
        subItemVersionDownloads.image           = 'sidebar-list-sub-item'
        item.children.push(subItemVersionDownloads)

        let subItemGemURL                       = new ListItem('Gem URL')
        subItemGemURL.descriptiveText           = apiGemData.gem_uri
        subItemGemURL.image                     = 'sidebar-list-sub-item'
        item.children.push(subItemGemURL)

        this._items.push( item )
      }
    }

    return true
  }

  /*
    Retrieves information from RubyGems.org for a given Gem name.
  */
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

  /*
    Returns the list items.
  */
  get items() {
    return this._items
  }
}

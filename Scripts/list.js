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
      for (let gemName of this._gemNames) {
        try {
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
        } catch(error) {
          FUNCTIONS.showNotification('RubyGems.org API Error',
            'There was an error retrieving information for one or more Gems from RubyGems.org. ' +
            'The site may be down or one or more gems in the Gemfile may not exist. ' +
            'Please check and try again or submit an extension issue report.')
        }
      }
    }

    return true
  }

  /*
    Retrieves information from RubyGems.org for a given Gem name.
  */
  async fetchRubyGem(gemName) {
    return new Promise((resolve, reject) => {
      fetch(`https://rubygems.org/api/v1/gems/${gemName}.json`)
        .then(response => response.json())
        .then(data => {
          resolve(data)
        })
        .catch(error => {
          FUNCTIONS.showConsoleError(`${error} -- Gem name: ${gemName}`)
          reject(error)
        })
    })
  }

  /*
    Returns the list items.
  */
  get items() {
    return this._items
  }
}

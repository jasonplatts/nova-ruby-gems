'use strict'

const FUNCTIONS = require('./functions.js')

/*
  Class handles the retrieval of default and user preference configurations
*/
exports.Configuration = class Configuration {
  constructor() {
    this._gems       = []
    this.gemfilePath = null
  }

  /*
    The base URL for Tailwind documentation.
  */
  static get RUBYGEMS_URL() {
    return 'https://rubgygems.org'
  }

  /*
    Gets Tailwind CSS class definitions in the form of an array Category objects,
    each containing an array of SubCategory objects with an array of Tailwind
    UtilityClass objects. The Tailwind UtilityClass objects have a label, detail,
    and documentation property.
  */
  get gems() {
    return this._gems
  }

  /*
    Loads all definition files defined in the Configuration.DEFINITION_FILES constant.
  */
  async loadGemfile() {
    let gemfilePath       = nova.workspace.config.get('rubygems.workspace.gemfileLocation')
    let gemfileHandler    = null
    let gemfileLinesArray = []

    if (FUNCTIONS.isWorkspace()) {
      // If no Gemfile set in the workspace preferences, try to open a Gemfile in the root directory.
      if (gemfilePath == null) {
        try {
          gemfileHandler = nova.fs.open(`${FUNCTIONS.normalizePath(nova.workspace.path)}/Gemfile`)
        } catch (error) {
          FUNCTIONS.showConsoleError(
            'No \'Gemfile\' could be found in the root directory of this project. Please go to the ' +
            'extension preferences and set the location of the \'Gemfile\' for this project.')
        }
      } else {
        try {
          gemfileHandler = nova.fs.open(`${FUNCTIONS.normalizePath(gemfilePath)}`)
        } catch (error) {
          FUNCTIONS.showConsoleError(
            'The \'Gemfile\' location set in the workspace preferences could not be found. Please check ' +
            'the location and try again.')
        }
      }
    }

    if (gemfileHandler !== null) {
      gemfileLinesArray = gemfileHandler.readlines()
      gemfileHandler.close()

      this._gems = await this._evaluateGemfileLines(gemfileLinesArray)
    }

    return this._gems
  }



  async _evaluateGemfileLines(gemfileLinesArray) {
    let gemNames = []

    gemfileLinesArray.forEach((line) => {
      if (line.search(/\sgem\s/) >= 0) {
        let gemName = this._evaluateGemfileLine(line)
        if (gemName !== null) { gemNames.push (gemName) }
      }
    })

    return gemNames
  }

  _evaluateGemfileLine(line) {
    let gemName = null

    if (line.trim()[0] !== '#') {
      gemName = line.trim().match(/(?:('|")[^('|")]*('|")|^[^('|")]*$)/)[0]
      gemName = gemName.replace(/('|")/g, '')
    }

    return gemName
  }

}


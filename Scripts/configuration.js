'use strict'

const FUNCTIONS = require('./functions.js')

/*
  Class handles the retrieval of user preferences and, if found, loads a Gemfile.
*/
exports.Configuration = class Configuration {
  constructor() {
    this._gems       = []
    this.gemfilePath = null
  }

  /*
    The base URL for RubyGems documentation.
  */
  static get RUBYGEMS_URL() {
    return 'https://rubygems.org'
  }

  /*
    Gets gem information form of an array of list item objects with sub-item objects.
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
      // If no Gemfile is set in the workspace preferences, try to open one in the root directory.
      if (gemfilePath == null) {
        try {
          gemfileHandler = nova.fs.open(`${FUNCTIONS.normalizePath(nova.workspace.path)}/Gemfile`)
        } catch (error) {
          console.log(
            'No \'Gemfile\' could be found in the root directory of this project. Please go to the ' +
            'extension preferences and set the location of the \'Gemfile\' for this project.')
        }
      } else {
        try {
          gemfileHandler = nova.fs.open(`${FUNCTIONS.normalizePath(gemfilePath)}`)
        } catch (error) {
          console.log(
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

  /*
    Evaluates each line in a Gemfile for gem information.
  */
  async _evaluateGemfileLines(gemfileLinesArray) {
    let gemNames = []

    gemfileLinesArray.forEach((line) => {
      if (line.search(/gem\s/) >= 0) {
        let gemName = this._evaluateGemfileLine(line)
        if (gemName !== null) { gemNames.push (gemName) }
      }
    })

    return gemNames
  }

  /*
    Evaluates a single line in a Gemfile for gem information.
  */
  _evaluateGemfileLine(line) {
    let gemName = null

    if (line.trim()[0] !== '#') {
      gemName = line.trim().match(/(?:('|")[^('|")]*('|")|^[^('|")]*$)/)[0]
      gemName = gemName.replace(/('|")/g, '')
    }

    return gemName
  }

}


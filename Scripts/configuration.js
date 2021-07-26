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
    let gemsObjectArray   = []

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

      gemsObjectArray = await this._evaluateGemfile(gemfileLinesArray)
    }

    return gemsObjectArray
  }

  async _evaluateGemfile(gemfileLinesArray) {
    gemfileLinesArray.forEach((line) => {
      console.log(line)
    })

    // let configObject = eval(newContents)

    return //configObject
  }

  /*
    Finds Gemfile file within the project directory.
  */
  async _findGemfiles() {
    return new Promise((resolve, reject) => {
      let returnValue = {
        status: 0,
        stdout: [],
        stderr: [],
      }

      let path    = FUNCTIONS.normalizePath(nova.workspace.path)
      let options = {
        args: ['-name', 'Gemfile', '-onlyin', path]
      }

      let process = new Process('/usr/bin/mdfind', options)

      process.onStdout((l) => {
        returnValue.stdout.push(l.trim())
      })

      process.onStderr((l) => {
        returnValue.stderr.push(l.trim())
      })

      process.onDidExit((status) => {
        returnValue.status = status
        if (status === 0) {
          resolve(returnValue)
        } else {
          reject(returnValue)
        }
      })

      try {
        process.start()
      } catch (e) {
        returnValue.status = 128
        returnValue.stderr = [e.message]
        reject(returnValue)
      }
    })
  }
}


const glob = require('glob-promise')
const path = require('path')
const robot = require('robotjs')
const Confirm = require('prompt-confirm')
const { makeAppActive } = require('./utils')

module.exports = async (files) => {
  try {
    const scriptFiles = files.length > 0 ? files : await glob('!(node_modules)/**/*.js')

    console.info(`\nFound ${scriptFiles.length} scripts to run.`)
    console.info('Please close Safari and do not move the mouse until the end.')
    console.info('It should take a few minutes, go grab a drink!\n')
    console.info('iTerm should reopen when its done.\n')

    const prompt = new Confirm('Ready?');
    if (!await prompt.run()) return

    robot.keyTap('h', 'command')

    for (const scriptFile of scriptFiles) {
      const script = require(`./${scriptFile}`)
      await script.run(getImagePath(scriptFile))
    }

    await makeAppActive('iTerm')

    console.info(`\nAll videos and screenshots were successfully recorded. You can use your mouse again\n`)
  } catch (error) {
    if (error.code === 'RECORDER_TIMEOUT') {
      console.error(error.message)
      console.info('The recorder timed out.')
      console.info('You probably need to activate the screen recording feature for the terminal you\'re using.')
      console.info('You\'ll find that settings under: System Parameters > Security & Confidentiality > Confidentiality > Screen recording')
    } else if (error.code === 'ENOTDIR') {
      console.error(error.message)
      console.info('A mandatory folder was not found.')
    } else {
      console.error('An error occured while recording', error)
    }
  }
}

const getImagePath = file => path.normalize(`../images/${path.dirname(file)}`)

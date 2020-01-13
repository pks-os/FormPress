require('ignore-styles')
const babel = require('@babel/core')
const fs = require('fs')
const path = require('path')

const options = {
  plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-modules-commonjs'],
  presets: ['@babel/preset-react'] 
}

const transformMap = [
  {
    type: 'file',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'Renderer.js'),
    target: path.resolve('./', 'script', 'transformed', 'Renderer.js')
  },
  {
    type: 'folder',
    extension: '.js',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'elements'),
    target: path.resolve('./', 'script', 'transformed', 'elements')
  },
  {
    type: 'folder',
    extension: '.css',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'elements'),
    target: path.resolve('./', 'script', 'transformed', 'elements')
  }
]

const transformFrontend = () => {
  for (const transform of transformMap) {
    const {type, source, target} = transform

    switch (type) {
      case 'file':
        const input = fs.readFileSync(source)
        console.log(`Transpiling ${source}`)
        const result = babel.transformSync(input, options)
        fs.writeFileSync(target, result.code)
        break
      case 'folder':
        //create target folder if does not exists
        if (fs.existsSync(target) === false) {
          fs.mkdirSync(target)
        }

        const files = fs.readdirSync(source)
          .filter((fileName) => fileName.endsWith(transform.extension))
        
        for (const file of files) {
          console.log(`Transpiling ${path.resolve(source, file)}`)

          if (file.endsWith('.css')) {
            fs.writeFileSync(path.resolve(target, file), '')
          } else {
            const input = fs.readFileSync(path.resolve(source, file))
            const result = babel.transformSync(input, options)
            fs.writeFileSync(path.resolve(target, file), result.code)
          }
        }
        break
    }
  }
}

transformFrontend()

module.exports = transformFrontend
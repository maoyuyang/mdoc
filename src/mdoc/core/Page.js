const fs = require('fs-extra')
const hash = require('hash-sum')
const fileToPath = require('../utils/fileToPath')
const parseFrontmatter = require('../utils/parseFrontmatter')
const logger = require('../utils/logger')

class Page {
  constructor({ content, filePath, relative, frontmatter = {} }, ctx) {
    this._filePath = filePath
    this._content = content
    this._context = ctx
    this._relative = relative
    this.frontmatter = frontmatter

    this.key = 'm-' + hash(this._filePath)
    this.path = encodeURI(fileToPath(this._relative))
  }

  async process({ markdown }) {
    if (this._filePath) {
      this._content = await fs.readFile(this._filePath, 'utf-8')
    }

    if (this._content) {
      const { content, data, excerpt } = parseFrontmatter(this._content)

      // 提取头部配置后剩余的content
      this._strippedContent = content
      // 渲染的html
      this.html = markdown.render(this._strippedContent)
      Object.assign(this.frontmatter, data)

      // 内容摘抄
      if (excerpt) {
        this.excerpt = excerpt
      }

      logger.debug('frontmatter: ', this.frontmatter)
    }
  }
}

module.exports = Page

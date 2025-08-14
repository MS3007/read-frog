import { browser, defineBackground, i18n } from '#imports'
import { WEBSITE_URL } from '@/utils/constants/url'
import { logger } from '@/utils/logger'
import { onMessage, sendMessage } from '@/utils/message'
import { setUpCacheCleanup } from './cache-cleanup'
import { ensureConfig } from './config'
import { newUserGuide } from './new-user-guide'
import { proxyFetch } from './proxy-fetch'
import { setUpRequestQueue } from './request-queue'
import { translationMessage } from './translation'

export default defineBackground(() => {
  logger.info('Hello background!', { id: browser.runtime.id })

  browser.runtime.onInstalled.addListener(async (details) => {
    await ensureConfig()
    // Open tutorial page when extension is installed
    if (details.reason === 'install') {
      await browser.tabs.create({
        url: `${WEBSITE_URL}/guide/step-1`,
      })
    }
  })

  onMessage('openPage', async (message) => {
    const { url, active } = message.data
    logger.info('openPage', { url, active })
    await browser.tabs.create({ url, active: active ?? true })
  })

  onMessage('getInitialConfig', async () => {
    return await ensureConfig()
  })

  onMessage('openOptionsPage', () => {
    logger.info('openOptionsPage')
    browser.runtime.openOptionsPage()
  })

  onMessage('popupRequestReadArticle', async (message) => {
    sendMessage('readArticle', undefined, message.data.tabId)
  })

  newUserGuide()
  translationMessage()

  setUpRequestQueue()
  setUpCacheCleanup()

  proxyFetch()

  // Create context menus for selection translation and page translation toggle
  try {
    browser.contextMenus.create({
      id: 'readfrog-translate-selection',
      title: i18n.t('rightClickMenu.translateSelection'),
      contexts: ['selection'],
    })

    browser.contextMenus.onClicked.addListener(async (info, tab) => {
      const tabId = tab?.id
      if (typeof tabId !== 'number')
        return

      if (info.menuItemId === 'readfrog-translate-selection') {
        // Notify selection.content to open translate popover for current selection
        sendMessage('triggerSelectionTranslate', undefined, tabId)
      }
    })
  }
  catch (err) {
    logger.error('Failed to create context menus', err)
  }
})

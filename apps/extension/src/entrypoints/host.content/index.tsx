import { browser, defineContentScript } from '#imports'
// import eruda from 'eruda'
import { globalConfig, loadGlobalConfig } from '@/utils/config/config'
import { shouldEnableAutoTranslation } from '@/utils/host/translate/auto-translation'
import { logger } from '@/utils/logger'
import { onMessage, sendMessage } from '@/utils/message'
import { registerNodeTranslationTriggers } from './translation-control/node-translation'
import { PageTranslationManager } from './translation-control/page-translation'
import './listen'
import './style.css'

export default defineContentScript({
  matches: ['*://*/*'],
  async main() {
    await loadGlobalConfig()
    // eruda.init()

    registerNodeTranslationTriggers()

    const port = browser.runtime.connect({ name: 'translation-host.content' })
    const manager = new PageTranslationManager({
      root: null,
      rootMargin: '1000px',
      threshold: 0,
    })

    manager.registerPageTranslationTriggers()

    const handleUrlChange = (from: string, to: string) => {
      if (from !== to) {
        logger.info('URL changed from', from, 'to', to)
        if (manager.isActive) {
          manager.stop()
        }
        // Notify background script that URL has changed, let it decide whether to automatically enable translation
        sendMessage('resetPageTranslationOnNavigation', { url: to })
      }
    }

    window.addEventListener('extension:URLChange', (e: any) => {
      const { from, to } = e.detail
      handleUrlChange(from, to)
    })

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Listen for Alt + Q for translation toggle (Windows: Alt + Q, Mac: Option + Q)
      if (
        e.altKey
        && !e.ctrlKey
        && !e.shiftKey
        && !e.metaKey
        && (e.code === 'KeyQ' || (typeof e.key === 'string' && e.key.toLowerCase() === 'q'))
      ) {
        e.preventDefault() // Prevent any default browser behavior
        if (manager.isActive) {
          manager.stop()
        }
        else {
          manager.start()
        }
      }
    }, { capture: true })

    port.onMessage.addListener((msg) => {
      logger.info('onMessage', msg)
      if (msg.type !== 'STATUS_PUSH' || msg.enabled === manager.isActive)
        return
      msg.enabled ? manager.start() : manager.stop()
    })

    // Listen for background context-menu action: trigger selection translate
    onMessage('triggerSelectionTranslate', () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0)
        return
      // Let SelectionToolbar logic react to selection change and show UI
      const ev = new Event('selectionchange')
      document.dispatchEvent(ev)
    })

    // ! Temporary code for browser has no port.onMessage.addListener api like Orion
    const autoEnable = globalConfig && await shouldEnableAutoTranslation(window.location.href, globalConfig)
    if (autoEnable && !manager.isActive)
      manager.start()
  },
})

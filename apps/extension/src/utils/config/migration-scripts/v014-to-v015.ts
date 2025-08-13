export function migrate(oldConfig: any): any {
  return {
    ...oldConfig,
    textSelectionTooltip:
      oldConfig?.textSelectionTooltip && typeof oldConfig.textSelectionTooltip.enabled === 'boolean'
        ? oldConfig.textSelectionTooltip
        : { enabled: true },
  }
}

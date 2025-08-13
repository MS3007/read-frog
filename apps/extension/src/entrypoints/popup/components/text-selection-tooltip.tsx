import { i18n } from '#imports'
import { Switch } from '@repo/ui/components/switch'
import { useAtom } from 'jotai'
import { useId } from 'react'
import { configFields } from '@/utils/atoms/config'

export default function TextSelectionTooltip() {
  const labelId = useId()
  const [textSelectionTooltip, setTextSelectionTooltip] = useAtom(
    configFields.textSelectionTooltip,
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <span id={labelId} className="text-[13px] font-medium">
        {i18n.t('popup.enabledTextSelectionTooltip')}
      </span>
      <Switch
        checked={textSelectionTooltip.enabled}
        aria-labelledby={labelId}
        onCheckedChange={(checked) => {
          setTextSelectionTooltip({ ...textSelectionTooltip, enabled: checked })
        }}
      />
    </div>
  )
}

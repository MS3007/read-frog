import { i18n } from '#imports'
import { Switch } from '@repo/ui/components/switch'
import { useAtom } from 'jotai'
import { configFields } from '@/utils/atoms/config'

export default function TextSelectionButton() {
  const [textSelectionButton, setTextSelectionButton] = useAtom(
    configFields.textSelectionButton,
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium">
        {i18n.t('popup.enabledTextSelectionButton')}
      </span>
      <Switch
        checked={textSelectionButton.enabled}
        onCheckedChange={(checked) => {
          setTextSelectionButton({ enabled: checked })
        }}
      />
    </div>
  )
}

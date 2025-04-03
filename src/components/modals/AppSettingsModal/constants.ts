import { Tab } from '@banx/components/Tabs'

import { PriorityLevel, SLIPPAGE_VALUES, getHumanReadablePriorityLevel } from '@banx/store'

export const PRIORITY_TYPED_TABS: Tab[] = Object.values(PriorityLevel).map((priorityLevel) => ({
  label: getHumanReadablePriorityLevel(priorityLevel),
  value: priorityLevel,
}))

export const SLIPPAGE_TABS: Tab[] = SLIPPAGE_VALUES.map((slippage) => ({
  label: `${slippage}%`,
  value: slippage.toString(),
}))

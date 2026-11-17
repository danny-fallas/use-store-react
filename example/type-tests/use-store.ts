import { usePersistedState, useSessionState } from '@dannyman/use-store'

function verifyPublicHookTypes() {
  const [optionalValue] = usePersistedState<number>('optional-value')
  const possiblyUndefined: number | undefined = optionalValue

  const [, setWriteOnlyValue] = useSessionState('write-only-value')
  setWriteOnlyValue(42)

  const [count, setCount] = usePersistedState('count', 0)
  const definitelyNumber: number = count
  setCount(current => current + 1)

  void possiblyUndefined
  void definitelyNumber
}

void verifyPublicHookTypes

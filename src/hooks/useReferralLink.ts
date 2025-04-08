import { useCallback, useEffect } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { usePathname, useRouter } from 'next/navigation'

import { RefferralModal } from '@banx/components/modals'

import { user } from '@banx/api/common'
import { useBanxLogin, useIsLedger, useModal } from '@banx/store/common'
import { generateSignature } from '@banx/utils/auth'
import { enqueueSnackbar } from '@banx/utils/snackbar'

export const useReferralLink = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const pathname = usePathname()
  const router = useRouter()

  const { close } = useModal()

  const { jwt, AUTH_MESSAGE, logIn } = useBanxLogin()

  const removeRefFromPath = useCallback(() => {
    const pathWithoutRef = pathname.replace(/ref=([^/]*)/, '')
    router.replace(pathWithoutRef)
  }, [pathname, router])

  const getWalletJwt = useCallback(async () => {
    if (!wallet.publicKey) return

    const signature = await generateSignature({
      isLedger,
      nonce: AUTH_MESSAGE,
      wallet,
      connection,
    })

    if (!signature) return

    return await logIn({
      signature,
      walletPubkey: wallet.publicKey,
    })
  }, [AUTH_MESSAGE, connection, isLedger, logIn, wallet])

  const onRefLink = useCallback(
    async (referralCode: string) => {
      try {
        const walletJwt = jwt || (await getWalletJwt())

        if (!walletJwt) return

        const linkResponse = await user.linkRef({
          walletJwt,
          refCode: referralCode,
        })

        if (!linkResponse.success) {
          throw new Error(linkResponse.message || 'Unable to link ref code')
        }

        enqueueSnackbar({
          message: 'Added referrer successfully',
          type: 'success',
        })

        removeRefFromPath()
        close()
      } catch (error) {
        console.error({ error })
        if (error instanceof Error) {
          enqueueSnackbar({ message: error?.message, type: 'error' })
        }
      }
    },
    [jwt, getWalletJwt, removeRefFromPath, close],
  )

  return { onRefLink, removeRefFromPath }
}

export const useReferralCodeModalTrigger = () => {
  const { open } = useModal()
  const pathname = usePathname()

  useEffect(() => {
    const referralCode = extractReferralCodeFromPath(pathname)
    if (referralCode) {
      open(RefferralModal)
    }
  }, [open, pathname])
}

export const extractReferralCodeFromPath = (pathname: string) => {
  const match = pathname.match(/ref=([^/]*)/)
  return match ? match[1] : null
}

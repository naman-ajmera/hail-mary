import { useState, useEffect } from 'react'

/**
 * Hook to manage reservation hold countdown timer (default 600s / 10 mins).
 */
export function useCountdown(initialSeconds = 600, onExpire?: () => void) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds)

  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (onExpire) onExpire()
      return
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsRemaining, onExpire])

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const resetTimer = (newSeconds = initialSeconds) => {
    setSecondsRemaining(newSeconds)
  }

  return {
    secondsRemaining,
    formattedTime,
    isExpired: secondsRemaining <= 0,
    resetTimer,
  }
}


'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchParamsMessage() {
  const params = useSearchParams()
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    if (params.get("registered")) {
      setSuccessMsg("Registration successful! Please sign in.")
    }
  }, [params])

  return successMsg ? <p className="text-green-600 text-center mt-2">{successMsg}</p> : null
}

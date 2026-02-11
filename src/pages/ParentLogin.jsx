import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

export default function ParentLogin() {
  useEffect(() => {}, [])
  return <Navigate to="/login" replace />
}

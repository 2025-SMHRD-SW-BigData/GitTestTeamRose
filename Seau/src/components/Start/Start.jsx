import React from 'react'
import { AuthSidebar } from './AuthSiderbar'

const Start = ({isOpen, onClose, initialMode}) => {
  return (
    <div>
      <AuthSidebar isOpen={isOpen} onClose={onClose} initialMode={initialMode}/>
    </div>
  )
}

export default Start
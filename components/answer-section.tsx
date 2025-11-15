'use client'

import { ChatRequestOptions } from 'ai'
import { Volume2 } from 'lucide-react' 

import { BotMessage } from './message'
import { Button } from './ui/button'
import { CollapsibleMessage } from './collapsible-message'
import { DefaultSkeleton } from './default-skeleton'
import { MessageActions } from './message-actions'
export type AnswerSectionProps = {
 content: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  chatId?: string
  showActions?: boolean
  messageId: string
  reload?: (
    messageId: string,
    options?: ChatRequestOptions
  ) => Promise<string | null | undefined>
}

export function AnswerSection({
  content,
  isOpen,
  onOpenChange,
  chatId,
  showActions = true, // Default to true for backward compatibility
  messageId,
  reload
}: AnswerSectionProps) {
  const enableShare = process.env.NEXT_PUBLIC_ENABLE_SHARE === 'true'

  const handleReload = () => {
    if (reload) {
      return reload(messageId)
    }
    return Promise.resolve(undefined)
  }

  // ******* TTS (Listen) Logic *******
  const handleListen = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Basic check to prevent reading empty content
      if (!content || content.trim().length === 0) {
          alert('Nothing to read.')
          return
      }
      
      const utterance = new SpeechSynthesisUtterance(content)
      // Optional: Set voice, pitch, rate if needed
      // utterance.rate = 1.0; 
      // utterance.pitch = 1.0; 
      
      window.speechSynthesis.speak(utterance)
      alert('Reading answer aloud... (Functionality added)')
    } else {
      alert('Text-to-Speech not supported in this browser.')
    }
  }
  // ******* End TTS Logic *******

  const message = content ? (
    <div className="flex flex-col gap-1">
      <BotMessage message={content} />
      {showActions && (
        <div className="flex items-center gap-2 mt-1"> 
          {/* Listen Button (Speaker Icon) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleListen}
            className="size-8" 
            title="Listen to answer"
          >
            <Volume2 className="size-4" />
          </Button>

          {/* Existing Message Actions (Copy, Reload, etc.) */}
          <MessageActions
            message={content} // Keep original message content for copy
            messageId={messageId}
            chatId={chatId || ''}
            enableShare={enableShare}
            reload={handleReload}
          />
        </div>
      )}
    </div>
  ) : (
    <DefaultSkeleton />
  )
  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showBorder={false}
      showIcon={false}
    >
      {message}
    </CollapsibleMessage>
  )
}
          

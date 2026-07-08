import { useState } from 'react'
import './CodeBlock.css'
import { ContentCopy, Check } from '@nine-thirty-five/material-symbols-react/outlined'

// Plain <pre> + a copy button — no syntax highlighting library, since
// these are short usage snippets, not full files. Copied state resets
// on its own after a beat instead of needing a separate "reset" event.
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="code-block">
      <button type="button" className="code-block-copy" onClick={handleCopy} aria-label="Copiar código">
        {copied ? <Check /> : <ContentCopy />}
      </button>
      <pre className="code-block-pre">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default CodeBlock

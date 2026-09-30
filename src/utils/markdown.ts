import DOMPurify from 'dompurify'
import { Marked } from 'marked'

const marked = new Marked({ gfm: true, breaks: true, async: false })

export const renderMarkdown = (source: string) => DOMPurify.sanitize(marked.parse(source) as string)

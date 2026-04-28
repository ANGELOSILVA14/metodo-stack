import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  TableOfContents,
} from 'docx'

interface DocSection {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'empty' | 'pagebreak'
  text?: string
  runs?: Array<{ text: string; bold?: boolean; italic?: boolean }>
}

export interface DocGeneratorOptions {
  userName?: string
  communityName?: string
  generatedAt?: string
}

function parseMarkdown(content: string): DocSection[] {
  const lines = content.split('\n')
  const sections: DocSection[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '') {
      sections.push({ type: 'empty' })
      continue
    }

    if (trimmed === '---') {
      sections.push({ type: 'pagebreak' })
      continue
    }

    if (trimmed.startsWith('# ')) {
      sections.push({ type: 'h1', text: trimmed.slice(2) })
      continue
    }

    if (trimmed.startsWith('## ')) {
      sections.push({ type: 'h2', text: trimmed.slice(3) })
      continue
    }

    if (trimmed.startsWith('### ')) {
      sections.push({ type: 'h3', text: trimmed.slice(4) })
      continue
    }

    sections.push({ type: 'paragraph', runs: parseInlineFormatting(trimmed) })
  }

  return sections
}

function parseInlineFormatting(text: string): Array<{ text: string; bold?: boolean; italic?: boolean }> {
  const runs: Array<{ text: string; bold?: boolean; italic?: boolean }> = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) runs.push({ text: match[2], bold: true })
    else if (match[3]) runs.push({ text: match[3], italic: true })
    else if (match[4]) runs.push({ text: match[4] })
  }

  return runs.length > 0 ? runs : [{ text }]
}

function sectionToParagraph(section: DocSection): Paragraph {
  switch (section.type) {
    case 'h1':
      return new Paragraph({
        text: section.text || '',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })

    case 'h2':
      return new Paragraph({
        text: section.text || '',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 160 },
      })

    case 'h3':
      return new Paragraph({
        text: section.text || '',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 120 },
      })

    case 'empty':
      return new Paragraph({ text: '' })

    case 'pagebreak':
      return new Paragraph({ children: [new PageBreak()] })

    case 'paragraph':
    default: {
      const children = (section.runs || [{ text: section.text || '' }]).map(
        (run) => new TextRun({ text: run.text, bold: run.bold, italics: run.italic, size: 24 })
      )
      return new Paragraph({
        children,
        spacing: { after: 160 },
        alignment: AlignmentType.JUSTIFIED,
      })
    }
  }
}

function buildCompleteChildren(sections: DocSection[]): (Paragraph | TableOfContents)[] {
  const result: (Paragraph | TableOfContents)[] = []
  let titleSeen = false
  let tocInserted = false

  for (const section of sections) {
    // Intercept the first --- after the document title to inject the TOC page
    if (!tocInserted && section.type === 'pagebreak' && titleSeen) {
      tocInserted = true
      // End title page
      result.push(new Paragraph({ children: [new PageBreak()] }))
      // TOC heading
      result.push(new Paragraph({
        text: 'Sumário',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 300 },
      }))
      // TOC field (Word updates automatically on open)
      result.push(new TableOfContents('Sumário', {
        hyperlink: true,
        headingStyleRange: '1-3',
      }))
      // Page break to start PARTE 1 on a new page
      result.push(new Paragraph({ children: [new PageBreak()] }))
      continue
    }

    if (section.type === 'h1') titleSeen = true
    result.push(sectionToParagraph(section))
  }

  return result
}

export async function generateWordDocument(
  content: string,
  title: string,
  options?: DocGeneratorOptions,
): Promise<Buffer> {
  const sections = parseMarkdown(content)

  // Extract community name from first h1 if not explicitly provided
  let communityName = options?.communityName
  if (!communityName) {
    const firstH1 = sections.find((s) => s.type === 'h1')
    if (firstH1?.text) communityName = firstH1.text.split(' — ')[0].trim()
  }

  const userName = options?.userName || ''
  const dateStr = options?.generatedAt || new Date().toLocaleDateString('pt-BR')
  const isComplete = !!options

  const children = isComplete
    ? buildCompleteChildren(sections)
    : sections.map(sectionToParagraph)

  const sectionConfig = {
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    ...(isComplete && {
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: communityName || title,
                  color: '1e3a8a',
                  size: 18,
                  font: 'Calibri',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: userName || 'Método Stack', size: 18, font: 'Calibri' }),
                new TextRun({ text: '  ·  ', size: 18, font: 'Calibri' }),
                new TextRun({ text: dateStr, size: 18, font: 'Calibri' }),
                new TextRun({ text: '  ·  Gerado pelo Método Stack', size: 18, font: 'Calibri' }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
    }),
    children,
  }

  const doc = new Document({
    creator: 'Método Stack',
    title,
    description: 'Gerado pelo Método Stack',
    features: { updateFields: true },
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 24 },
        },
        heading1: {
          run: { font: 'Calibri', size: 36, bold: true, color: '1e3a8a' },
        },
        heading2: {
          run: { font: 'Calibri', size: 28, bold: true, color: '1e3271' },
        },
        heading3: {
          run: { font: 'Calibri', size: 24, bold: true, color: '374151' },
        },
      },
    },
    sections: [sectionConfig],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}

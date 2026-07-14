import { useRef, useState } from 'react'
import { exportData, importData } from '../db'
import TopNav from '../components/TopNav'
import Banner from '../components/Banner'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import { ArrowBack, Download, UploadFile } from '@nine-thirty-five/material-symbols-react/outlined'
import './Backup.css'

// Export downloads everything as a JSON file via a throwaway <a download>
// — no library needed for a one-shot client-side save. Import is the
// reverse: a hidden <input type="file"> (a Button can't open a file
// picker by itself) reads + JSON.parses the chosen file, then — since
// this replaces 100% of the user's data — requires confirming in a
// destructive BottomSheet before anything is written, same pattern
// ManageLanguages uses for removing a language. A successful import
// reloads the page rather than hand-resyncing every screen's in-memory
// state (languages list, active language, timer, etc.) individually.
function Backup({ onBack, embedded }) {
  const fileInputRef = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [importError, setImportError] = useState(null)
  const [importing, setImporting] = useState(false)

  async function handleExport() {
    const data = await exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `imerso-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be picked again later

    if (!file) return

    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data?.languages) || !Array.isArray(data?.sessions)) {
        throw new Error('invalid backup shape')
      }
      setPendingImport(data)
    } catch {
      setImportError('Esse arquivo não é um backup válido do Imerso.')
    }
  }

  async function handleConfirmImport() {
    setImporting(true)
    await importData(pendingImport)
    window.location.reload()
  }

  return (
    <main className="backup" data-embedded={embedded || undefined}>
      {!embedded && (
        <TopNav
          title="Backup"
          hasDivider
          leadingIcon={
            <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
              <ArrowBack />
            </button>
          }
        />
      )}
      <div className="backup-content">
        <Banner
          type="secondary"
          title="Exportar dados"
          description="Baixa um arquivo no formato JSON com todos os seus dados."
          primaryButton={
            <Button variant="outline" size="sm" leadingIcon={<Download />} onClick={handleExport}>
              Exportar
            </Button>
          }
        />
        <Banner
          type="secondary"
          title="Importar dados"
          description="Substitui seus dados atuais pelo arquivo importado. Só aceita arquivos JSON."
          primaryButton={
            <Button variant="outline" size="sm" leadingIcon={<UploadFile />} onClick={handleImportClick}>
              Importar
            </Button>
          }
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <BottomSheet
        open={Boolean(pendingImport)}
        onClose={() => setPendingImport(null)}
        title="Substituir todos os dados?"
        description="Seus idiomas e sessões atuais serão apagados e substituídos pelo arquivo importado. Essa ação não pode ser desfeita."
        contentCard={false}
        primaryButton={
          <Button variant="destructive" fullWidth disabled={importing} onClick={handleConfirmImport}>
            Substituir
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" fullWidth disabled={importing} onClick={() => setPendingImport(null)}>
            Cancelar
          </Button>
        }
      />

      <BottomSheet
        open={Boolean(importError)}
        onClose={() => setImportError(null)}
        title="Arquivo inválido"
        description={importError}
        contentCard={false}
        primaryButton={
          <Button variant="primary" fullWidth onClick={() => setImportError(null)}>
            Ok
          </Button>
        }
      />
    </main>
  )
}

export default Backup

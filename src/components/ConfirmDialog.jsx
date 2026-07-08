import BottomSheet from './BottomSheet'
import Button from './Button'

// Shared destructive-confirmation sheet (currently: bulk delete from
// selection mode in DayHistory and Library). variant="modal" — same
// centered-card presentation BottomSheet already uses for
// keyboard-triggering content — reads better for a plain yes/no
// prompt at any breakpoint than an edge-anchored sheet would.
function ConfirmDialog({ open, title, description, confirmLabel = 'Excluir', onCancel, onConfirm }) {
  return (
    <BottomSheet
      open={open}
      onClose={onCancel}
      variant="modal"
      title={title}
      description={description}
      primaryButton={
        <Button variant="destructive" fullWidth onClick={onConfirm}>
          {confirmLabel}
        </Button>
      }
      secondaryButton={
        <Button variant="outline" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
      }
    />
  )
}

export default ConfirmDialog

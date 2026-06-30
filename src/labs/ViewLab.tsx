import { Row, Column, Badge, Button, Alert, Toast, Callout, Label } from '@hospitalrun/components'
import format from 'date-fns/format'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'

import useAddBreadcrumbs from '../page-header/breadcrumbs/useAddBreadcrumbs'
import { useUpdateTitle } from '../page-header/title/TitleContext'
import usePatient from '../patients/hooks/usePatient'
import TextFieldWithLabelFormGroup from '../shared/components/input/TextFieldWithLabelFormGroup'
import useTranslator from '../shared/hooks/useTranslator'
import Lab from '../shared/model/Lab'
import Note from '../shared/model/Note'
import Patient from '../shared/model/Patient'
import Permissions from '../shared/model/Permissions'
import { RootState } from '../shared/store'
import { uuid } from '../shared/util/uuid'
import useCancelLab from './hooks/useCancelLab'
import useCompleteLab from './hooks/useCompleteLab'
import useLab from './hooks/useLab'
import useUpdateLab from './hooks/useUpdateLab'
import { LabError } from './utils/validate-lab'

const getTitle = (patient: Patient | undefined, lab: Lab | undefined) =>
  patient && lab ? `${lab.type} for ${patient.fullName}(${lab.code})` : ''

const formatLabDate = (date: string) => format(new Date(date), 'yyyy-MM-dd hh:mm a')

const getBadgeColor = (status: Lab['status']) => {
  if (status === 'completed') {
    return 'primary'
  }
  if (status === 'canceled') {
    return 'danger'
  }
  return 'warning'
}

type TranslationFunction = (key: string) => string

type LabSummaryItemProps = {
  className: string
  label: string
  value: React.ReactNode
}

const LabSummaryItem = ({ className, label, value }: LabSummaryItemProps) => (
  <Column>
    <div className={`form-group ${className}`}>
      <h4>{label}</h4>
      <h5>{value}</h5>
    </div>
  </Column>
)

type LabStatusProps = {
  lab: Lab
  t: TranslationFunction
}

const LabStatus = ({ lab, t }: LabStatusProps) => (
  <Column>
    <div className="form-group lab-status">
      <h4>{t('labs.lab.status')}</h4>
      <Badge color={getBadgeColor(lab.status)}>
        <h5>{lab.status}</h5>
      </Badge>
    </div>
  </Column>
)

const LabCompletedOrCanceledDate = ({ lab, t }: LabStatusProps) => {
  if (lab.status === 'completed' && lab.completedOn) {
    return (
      <LabSummaryItem
        className="completed-on"
        label={t('labs.lab.completedOn')}
        value={formatLabDate(lab.completedOn)}
      />
    )
  }
  if (lab.status === 'canceled' && lab.canceledOn) {
    return (
      <LabSummaryItem
        className="canceled-on"
        label={t('labs.lab.canceledOn')}
        value={formatLabDate(lab.canceledOn)}
      />
    )
  }
  return null
}

type LabSummaryProps = {
  lab: Lab
  patient: Patient
  t: TranslationFunction
}

const LabSummary = ({ lab, patient, t }: LabSummaryProps) => (
  <Row>
    <LabStatus lab={lab} t={t} />
    <LabSummaryItem className="for-patient" label={t('labs.lab.for')} value={patient.fullName} />
    <LabSummaryItem className="lab-type" label={t('labs.lab.type')} value={lab.type} />
    <LabSummaryItem
      className="requested-on"
      label={t('labs.lab.requestedOn')}
      value={formatLabDate(lab.requestedOn)}
    />
    <LabCompletedOrCanceledDate lab={lab} t={t} />
  </Row>
)

type PastNotesProps = {
  notes: Note[]
  canDeleteNotes: boolean
  onDeleteNote: (noteId: string) => Promise<void>
}

const PastNotes = ({ notes, canDeleteNotes, onDeleteNote }: PastNotesProps) => {
  if (!notes.length) {
    return null
  }

  return (
    <>
      {notes
        .filter((note) => !note.deleted)
        .map((note) => (
          <Callout key={note.id} color="info">
            <div className="d-flex justify-content-between">
              <p data-testid="note">{note.text}</p>
              {canDeleteNotes && (
                <Button icon="remove" onClick={async () => onDeleteNote(note.id)} color="danger">
                  <span data-testid={`delete-note-${note.id}`}>Delete</span>
                </Button>
              )}
            </div>
          </Callout>
        ))}
    </>
  )
}

type LabActionButtonsProps = {
  labStatus: Lab['status']
  permissions: (Permissions | null)[]
  onUpdate: () => Promise<void>
  onComplete: () => Promise<void>
  onCancel: () => Promise<void>
  t: TranslationFunction
}

const LabActionButtons = ({
  labStatus,
  permissions,
  onUpdate,
  onComplete,
  onCancel,
  t,
}: LabActionButtonsProps) => {
  if (labStatus === 'completed' || labStatus === 'canceled') {
    return null
  }

  return (
    <>
      <Button className="mr-2" color="success" onClick={onUpdate} key="actions.update">
        {t('labs.requests.update')}
      </Button>
      {permissions.includes(Permissions.CompleteLab) && (
        <Button className="mr-2" onClick={onComplete} color="primary" key="labs.requests.complete">
          {t('labs.requests.complete')}
        </Button>
      )}
      {permissions.includes(Permissions.CancelLab) && (
        <Button onClick={onCancel} color="danger" key="labs.requests.cancel">
          {t('labs.requests.cancel')}
        </Button>
      )}
    </>
  )
}

const ViewLab = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslator()
  const history = useHistory()
  const { permissions } = useSelector((state: RootState) => state.user)

  const [labToView, setLabToView] = useState<Lab>()
  const [newNoteText, setNewNoteText] = useState<string>()
  const [isEditable, setIsEditable] = useState<boolean>(true)

  const { data: lab } = useLab(id)
  const { data: patient } = usePatient(lab?.patient)
  const [updateLab] = useUpdateLab()
  const [completeLab] = useCompleteLab()
  const [cancelLab] = useCancelLab()
  const [error, setError] = useState<LabError | undefined>(undefined)

  const updateTitle = useUpdateTitle()
  useEffect(() => {
    updateTitle(getTitle(patient, labToView))
  })

  const breadcrumbs = [
    {
      i18nKey: 'labs.requests.view',
      location: `/labs/${labToView?.id}`,
    },
  ]
  useAddBreadcrumbs(breadcrumbs)

  useEffect(() => {
    if (lab) {
      setLabToView({ ...lab })
      setIsEditable(lab.status === 'requested')
    }
  }, [lab])

  const onResultChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const result = event.currentTarget.value
    if (labToView) {
      setLabToView({ ...labToView, result })
    }
  }

  const onNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const notes = event.currentTarget.value
    setNewNoteText(notes)
  }

  const deleteNote = async (noteIdToDelete: string) => {
    if (!labToView || !labToView.notes) {
      return
    }

    const updatedNotes = labToView.notes.map((note) =>
      note.id === noteIdToDelete ? { ...note, deleted: true } : note,
    )

    const newLab = {
      ...labToView,
      notes: updatedNotes,
    }

    await updateLab(newLab as Lab)
    Toast('success', t('states.success'), t('labs.successfullyDeletedNote'))
  }

  const onUpdate = async () => {
    if (labToView) {
      let newLab = labToView
      if (newNoteText) {
        const newNote = {
          id: uuid(),
          date: new Date().toISOString(),
          text: newNoteText,
          deleted: false,
        }

        newLab = {
          ...newLab,
          notes: newLab.notes ? [...newLab.notes, newNote] : [newNote],
        }
        setNewNoteText('')
      }

      const updatedLab = await updateLab(newLab)
      history.push(`/labs/${updatedLab?.id}`)
      Toast(
        'success',
        t('states.success'),
        `${t('labs.successfullyUpdated')} ${updatedLab?.type} for ${patient?.fullName}`,
      )
    }
    setError(undefined)
  }

  const onComplete = async () => {
    try {
      if (labToView) {
        const completedLab = await completeLab(labToView)
        history.push(`/labs/${completedLab?.id}`)
        Toast(
          'success',
          t('states.success'),
          `${t('labs.successfullyCompleted')} ${completedLab?.type} for ${patient?.fullName} `,
        )
      }
      setError(undefined)
    } catch (e) {
      setError(e)
    }
  }

  const onCancel = async () => {
    if (labToView) {
      cancelLab(labToView)
      history.push('/labs')
    }
  }

  if (labToView && patient) {
    return (
      <>
        {error && (
          <Alert color="danger" title={t('states.error')} message={t(error.message || '')} />
        )}
        <LabSummary lab={labToView} patient={patient} t={t} />
        <div className="border-bottom" />
        <form>
          <TextFieldWithLabelFormGroup
            name="result"
            label={t('labs.lab.result')}
            value={labToView.result}
            isEditable={isEditable}
            isInvalid={!!error?.result}
            feedback={t(error?.result as string)}
            onChange={onResultChange}
          />
          <Label text={t('labs.lab.notes')} htmlFor="notesTextField" />
          <PastNotes
            notes={labToView.notes || []}
            canDeleteNotes={labToView.status === 'requested'}
            onDeleteNote={deleteNote}
          />
          {isEditable && (
            <TextFieldWithLabelFormGroup
              name="notes"
              value={newNoteText}
              isEditable={isEditable}
              onChange={onNotesChange}
            />
          )}
          {isEditable && (
            <div className="row float-right">
              <div className="btn-group btn-group-lg mt-3 mr-3">
                <LabActionButtons
                  labStatus={labToView.status}
                  permissions={permissions}
                  onUpdate={onUpdate}
                  onComplete={onComplete}
                  onCancel={onCancel}
                  t={t}
                />
              </div>
            </div>
          )}
        </form>
      </>
    )
  }
  return <h1>Loading...</h1>
}

export default ViewLab

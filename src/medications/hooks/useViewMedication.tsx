import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import useAddBreadcrumbs from '../../page-header/breadcrumbs/useAddBreadcrumbs'
import { useUpdateTitle } from '../../page-header/title/TitleContext'
import { SelectOption } from '../../shared/components/input/SelectOption'
import useTranslator from '../../shared/hooks/useTranslator'
import Medication from '../../shared/model/Medication'
import Patient from '../../shared/model/Patient'
import Permissions from '../../shared/model/Permissions'
import { RootState } from '../../shared/store'
import { cancelMedication, fetchMedication, updateMedication } from '../medication-slice'

const getTitle = (patient: Patient | undefined, medication: Medication | undefined) =>
  patient && medication ? `${medication.medication} for ${patient.fullName}` : ''

export default function useViewMedication() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslator()
  const history = useHistory()
  const dispatch = useDispatch()
  const { permissions } = useSelector((state: RootState) => state.user)
  const { medication, patient, status, error } = useSelector((state: RootState) => state.medication)

  const [medicationToView, setMedicationToView] = useState<Medication>()
  const [isEditable, setIsEditable] = useState<boolean>(true)

  const updateTitle = useUpdateTitle()
  useEffect(() => {
    updateTitle(getTitle(patient, medicationToView))
  }, [medicationToView, patient, updateTitle])

  const breadcrumbs = [
    {
      i18nKey: 'medications.requests.view',
      location: `/medications/${medicationToView?.id}`,
    },
  ]
  useAddBreadcrumbs(breadcrumbs)

  useEffect(() => {
    if (id) {
      dispatch(fetchMedication(id))
    }
  }, [id, dispatch])

  useEffect(() => {
    if (medication) {
      setMedicationToView({ ...medication })
      setIsEditable(medication.status !== 'completed')
    }
  }, [medication])

  const statusOptionsEdit: SelectOption[] = [
    { label: t('medications.status.draft'), value: 'draft' },
    { label: t('medications.status.active'), value: 'active' },
    { label: t('medications.status.onHold'), value: 'on hold' },
    { label: t('medications.status.completed'), value: 'completed' },
    { label: t('medications.status.enteredInError'), value: 'entered in error' },
    { label: t('medications.status.canceled'), value: 'canceled' },
    { label: t('medications.status.unknown'), value: 'unknown' },
  ]

  const intentOptions: SelectOption[] = [
    { label: t('medications.intent.proposal'), value: 'proposal' },
    { label: t('medications.intent.plan'), value: 'plan' },
    { label: t('medications.intent.order'), value: 'order' },
    { label: t('medications.intent.originalOrder'), value: 'original order' },
    { label: t('medications.intent.reflexOrder'), value: 'reflex order' },
    { label: t('medications.intent.fillerOrder'), value: 'filler order' },
    { label: t('medications.intent.instanceOrder'), value: 'instance order' },
    { label: t('medications.intent.option'), value: 'option' },
  ]

  const priorityOptions: SelectOption[] = [
    { label: t('medications.priority.routine'), value: 'routine' },
    { label: t('medications.priority.urgent'), value: 'urgent' },
    { label: t('medications.priority.asap'), value: 'asap' },
    { label: t('medications.priority.stat'), value: 'stat' },
  ]

  const onQuantityChange = (text: string, name: string) => {
    const newMedication = medicationToView as Medication
    setMedicationToView({ ...newMedication, quantity: { ...newMedication.quantity, [name]: text } })
  }

  const onFieldChange = (key: string, value: string | boolean) => {
    const newMedication = medicationToView as Medication
    setMedicationToView({ ...newMedication, [key]: value })
  }

  const onNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const notes = event.currentTarget.value
    onFieldChange('notes', notes)
  }

  const onUpdate = async () => {
    const onSuccess = () => {
      history.push('/medications')
    }
    if (medicationToView) {
      dispatch(updateMedication(medicationToView, onSuccess))
    }
  }

  const onCancel = async () => {
    const onSuccess = () => {
      history.push('/medications')
    }

    if (medicationToView) {
      dispatch(cancelMedication(medicationToView, onSuccess))
    }
  }

  return {
    canCancelMedication: permissions.includes(Permissions.CancelMedication),
    error,
    intentOptions,
    isEditable,
    medicationToView,
    onCancel,
    onFieldChange,
    onNotesChange,
    onQuantityChange,
    onUpdate,
    patient,
    priorityOptions,
    status,
    statusOptionsEdit,
    t,
  }
}

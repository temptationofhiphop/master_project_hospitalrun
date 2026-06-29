import { Select, Row, Column, Badge, Button, Alert, Label } from '@hospitalrun/components'
import format from 'date-fns/format'
import React from 'react'

import TextFieldWithLabelFormGroup from '../shared/components/input/TextFieldWithLabelFormGroup'
import TextInputWithLabelFormGroup from '../shared/components/input/TextInputWithLabelFormGroup'
import useViewMedication from './hooks/useViewMedication'

const ViewMedication = () => {
  const {
    canCancelMedication,
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
  } = useViewMedication()

  const getButtons = () => {
    const buttons: React.ReactNode[] = []
    if (medicationToView?.status === 'canceled') {
      return buttons
    }

    buttons.push(
      <Button className="mr-2" color="success" onClick={onUpdate} key="actions.update">
        {t('medications.requests.update')}
      </Button>,
    )

    if (canCancelMedication) {
      buttons.push(
        <Button onClick={onCancel} color="danger" key="medications.requests.cancel">
          {t('medications.requests.cancel')}
        </Button>,
      )
    }

    return buttons
  }

  if (medicationToView && patient) {
    const getBadgeColor = () => {
      if (medicationToView.status === 'canceled') {
        return 'danger'
      }
      return 'warning'
    }

    const getCancelledOnDate = () => {
      if (medicationToView.status === 'canceled' && medicationToView.canceledOn) {
        return (
          <Column>
            <div className="form-group canceled-on">
              <h4>{t('medications.medication.canceledOn')}</h4>
              <h5>{format(new Date(medicationToView.canceledOn), 'yyyy-MM-dd hh:mm a')}</h5>
            </div>
          </Column>
        )
      }
      return <></>
    }

    return (
      <>
        {status === 'error' && (
          <Alert color="danger" title={t('states.error')} message={t(error.message || '')} />
        )}
        <Row>
          <Column>
            <div className="form-group medication-status">
              <h4>{t('medications.medication.status')}</h4>
              <Badge color={getBadgeColor()}>
                <h5>{medicationToView.status}</h5>
              </Badge>
            </div>
          </Column>
          <Column>
            <div className="form-group medication-medication">
              <h4>{t('medications.medication.medication')}</h4>
              <h5>{medicationToView.medication}</h5>
            </div>
          </Column>
          <Column>
            <div className="form-group medication-quantity">
              <h4>{t('medications.medication.quantity')}</h4>
              <h5>{`${medicationToView.quantity.value} x ${medicationToView.quantity.unit}`}</h5>
            </div>
          </Column>
          <Column>
            <div className="form-group for-patient">
              <h4>{t('medications.medication.for')}</h4>
              <h5>{patient.fullName}</h5>
            </div>
          </Column>
          <Column>
            <div className="form-group requested-on">
              <h4>{t('medications.medication.requestedOn')}</h4>
              <h5>{format(new Date(medicationToView.requestedOn), 'yyyy-MM-dd hh:mm a')}</h5>
            </div>
          </Column>
          {getCancelledOnDate()}
        </Row>
        <Row>
          <Column>
            <div className="form-group medication-intent">
              <h4>{t('medications.medication.intent')}</h4>
              <Badge color={getBadgeColor()}>
                <h5>{medicationToView.intent}</h5>
              </Badge>
            </div>
          </Column>
          <Column>
            <div className="form-group medication-priority">
              <h4>{t('medications.medication.priority')}</h4>
              <Badge color={getBadgeColor()}>
                <h5>{medicationToView.priority}</h5>
              </Badge>
            </div>
          </Column>
        </Row>
        <div className="border-bottom" />
        <Row>
          <Column>
            <Label title="status" text={t('medications.medication.status')} isRequired />
            <Select
              id="status"
              options={statusOptionsEdit}
              onChange={(values) => onFieldChange && onFieldChange('status', values[0])}
              disabled={!isEditable}
            />
          </Column>
          <Column>
            <Label title="intent" text={t('medications.medication.intent')} isRequired />
            <Select
              id="intent"
              options={intentOptions}
              onChange={(values) => onFieldChange && onFieldChange('intent', values[0])}
              disabled={!isEditable}
            />
          </Column>
          <Column>
            <Label title="priority" text={t('medications.medication.priority')} isRequired />
            <Select
              id="priority"
              options={priorityOptions}
              onChange={(values) => onFieldChange && onFieldChange('priority', values[0])}
              disabled={!isEditable}
            />
          </Column>
        </Row>
        <Row>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              name="quantityValue"
              label={`${t('medications.medication.quantity')} | ${t(
                'medications.medication.quantityValue',
              )}`}
              isEditable={isEditable}
              isRequired
              value={(medicationToView.quantity.value as unknown) as string}
              onChange={(event) => onQuantityChange(event.currentTarget.value, 'value')}
              isInvalid={!!error?.quantityValue}
              feedback={t(error?.quantityValue as string)}
            />
          </Column>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={`${t('medications.medication.quantity')} | ${t(
                'medications.medication.quantityUnit',
              )}`}
              name="quantityUnit"
              isRequired
              isEditable={isEditable}
              value={medicationToView.quantity.unit}
              onChange={(event) => onQuantityChange(event.currentTarget.value, 'unit')}
              isInvalid={!!error?.quantityUnit}
              feedback={t(error?.quantityUnit as string)}
            />
          </Column>
        </Row>
        <form>
          <Row>
            <Column>
              <TextFieldWithLabelFormGroup
                data-testid="notes"
                name="notes"
                label={t('medications.medication.notes')}
                value={medicationToView.notes}
                isEditable={isEditable}
                onChange={(event) => onNotesChange(event)}
              />
            </Column>
          </Row>
          {isEditable && (
            <div className="row float-right">
              <div className="btn-group btn-group-lg mt-3 mr-3">{getButtons()}</div>
            </div>
          )}
        </form>
      </>
    )
  }
  return <h1>Loading...</h1>
}

export default ViewMedication

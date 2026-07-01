import { Select, Label, Panel, Checkbox, Alert } from '@hospitalrun/components'
import differenceInYears from 'date-fns/differenceInYears'
import startOfDay from 'date-fns/startOfDay'
import subYears from 'date-fns/subYears'
import React, { ReactElement } from 'react'

import DatePickerWithLabelFormGroup from '../shared/components/input/DatePickerWithLabelFormGroup'
import { SelectOption } from '../shared/components/input/SelectOption'
import TextInputWithLabelFormGroup from '../shared/components/input/TextInputWithLabelFormGroup'
import useTranslator from '../shared/hooks/useTranslator'
import { ContactInfoPiece } from '../shared/model/ContactInformation'
import Patient from '../shared/model/Patient'
import ContactInfo from './ContactInfo'

interface Error {
  message?: string
  prefix?: string
  givenName?: string
  familyName?: string
  suffix?: string
  dateOfBirth?: string
  preferredLanguage?: string
  phoneNumbers?: (string | undefined)[]
  emails?: (string | undefined)[]
}

interface Props {
  patient: Patient
  isEditable?: boolean
  onChange?: (newPatient: Partial<Patient>) => void
  error?: Error
}

type PatientFieldValue = string | boolean | ContactInfoPiece[]
type TextFieldName =
  | 'prefix'
  | 'givenName'
  | 'familyName'
  | 'suffix'
  | 'occupation'
  | 'preferredLanguage'
type SelectFieldName = 'sex' | 'type' | 'bloodType'
type ContactFieldName = 'phoneNumbers' | 'emails' | 'addresses'

interface TextFieldConfig {
  className: string
  hasValidation?: boolean
  label: string
  name: TextFieldName
  isRequired?: boolean
  error?: string
}

interface SelectFieldConfig {
  className: string
  id: string
  label: string
  name: SelectFieldName
  options: SelectOption[]
  testId: string
  title: string
}

interface ContactInfoPanelConfig {
  component: 'TextInputWithLabelFormGroup' | 'TextFieldWithLabelFormGroup'
  className?: string
  errors?: (string | undefined)[]
  inputName: string
  label: string
  name: ContactFieldName
}

const GeneralInformation = (props: Props): ReactElement => {
  const { t } = useTranslator()
  const { patient, isEditable, onChange, error } = props

  const onFieldChange = (name: string, value: PatientFieldValue) => {
    if (onChange) {
      const newPatient = {
        ...patient,
        [name]: value,
      }
      onChange(newPatient)
    }
  }

  const guessDateOfBirthFromApproximateAge = (value: string) => {
    const age = Number.isNaN(parseFloat(value)) ? 0 : parseFloat(value)
    const dateOfBirth = subYears(new Date(Date.now()), age)
    return startOfDay(dateOfBirth).toISOString()
  }

  const onApproximateAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget
    onFieldChange('dateOfBirth', guessDateOfBirthFromApproximateAge(value))
  }

  const onUnknownDateOfBirthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget
    onFieldChange('isApproximateDateOfBirth', checked)
  }

  const onTextFieldChange = (name: TextFieldName) => (event: React.ChangeEvent<HTMLInputElement>) =>
    onFieldChange(name, event.currentTarget.value)

  const onContactInfoChange = (name: ContactFieldName) => (newContactInfo: ContactInfoPiece[]) =>
    onFieldChange(name, newContactInfo)

  const sexOptions: SelectOption[] = [
    { label: t('sex.male'), value: 'male' },
    { label: t('sex.female'), value: 'female' },
    { label: t('sex.other'), value: 'other' },
    { label: t('sex.unknown'), value: 'unknown' },
  ]

  const typeOptions: SelectOption[] = [
    { label: t('patient.types.charity'), value: 'charity' },
    { label: t('patient.types.private'), value: 'private' },
  ]

  const bloodTypeOptions: SelectOption[] = [
    { label: t('bloodType.apositive'), value: 'A+' },
    { label: t('bloodType.anegative'), value: 'A-' },
    { label: t('bloodType.abpositive'), value: 'AB+' },
    { label: t('bloodType.abnegative'), value: 'AB-' },
    { label: t('bloodType.bpositive'), value: 'B+' },
    { label: t('bloodType.bnegative'), value: 'B-' },
    { label: t('bloodType.opositive'), value: 'O+' },
    { label: t('bloodType.onegative'), value: 'O-' },
    { label: t('bloodType.unknown'), value: 'unknown' },
  ]

  const nameFields: TextFieldConfig[] = [
    {
      className: 'col-md-2',
      hasValidation: true,
      label: t('patient.prefix'),
      name: 'prefix',
      error: error?.prefix,
    },
    {
      className: 'col-md-4',
      hasValidation: true,
      label: t('patient.givenName'),
      name: 'givenName',
      isRequired: true,
      error: error?.givenName,
    },
    {
      className: 'col-md-4',
      hasValidation: true,
      label: t('patient.familyName'),
      name: 'familyName',
      error: error?.familyName,
    },
    {
      className: 'col-md-2',
      hasValidation: true,
      label: t('patient.suffix'),
      name: 'suffix',
      error: error?.suffix,
    },
  ]

  const selectFields: SelectFieldConfig[] = [
    {
      className: 'col',
      id: 'sexSelect',
      label: t('patient.sex'),
      name: 'sex',
      options: sexOptions,
      testId: 'sexSelect',
      title: 'sex',
    },
    {
      className: 'col',
      id: 'typeSelect',
      label: t('patient.type'),
      name: 'type',
      options: typeOptions,
      testId: 'typeSelect',
      title: 'type',
    },
    {
      className: 'col',
      id: 'bloodTypeSelect',
      label: t('patient.bloodType'),
      name: 'bloodType',
      options: bloodTypeOptions,
      testId: 'bloodTypeSelect',
      title: 'bloodType',
    },
  ]

  const detailFields: TextFieldConfig[] = [
    { className: 'col', label: t('patient.occupation'), name: 'occupation' },
    {
      className: 'col',
      hasValidation: true,
      label: t('patient.preferredLanguage'),
      name: 'preferredLanguage',
      error: error?.preferredLanguage,
    },
  ]

  const contactInfoPanels: ContactInfoPanelConfig[] = [
    {
      className: 'mb-4',
      component: 'TextInputWithLabelFormGroup',
      errors: error?.phoneNumbers,
      inputName: 'phoneNumber',
      label: 'patient.phoneNumber',
      name: 'phoneNumbers',
    },
    {
      className: 'mb-4',
      component: 'TextInputWithLabelFormGroup',
      errors: error?.emails,
      inputName: 'email',
      label: 'patient.email',
      name: 'emails',
    },
    {
      component: 'TextFieldWithLabelFormGroup',
      inputName: 'address',
      label: 'patient.address',
      name: 'addresses',
    },
  ]

  const renderTextField = (field: TextFieldConfig) => (
    <div className={field.className} key={field.name}>
      <TextInputWithLabelFormGroup
        label={field.label}
        name={field.name}
        value={patient[field.name]}
        isEditable={isEditable}
        onChange={onTextFieldChange(field.name)}
        isRequired={field.isRequired}
        isInvalid={field.hasValidation ? !!field.error : undefined}
        feedback={field.hasValidation ? t(field.error) : undefined}
      />
    </div>
  )

  const renderSelectField = (field: SelectFieldConfig) => (
    <div className={field.className} key={field.name}>
      <div className="form-group" data-testid={field.testId}>
        <Label text={field.label} title={field.title} />
        <Select
          id={field.id}
          options={field.options}
          defaultSelected={field.options.filter(({ value }) => value === patient[field.name])}
          onChange={(values) => onFieldChange(field.name, values[0])}
          disabled={!isEditable}
        />
      </div>
    </div>
  )

  const renderDateOfBirthField = () => {
    if (patient.isApproximateDateOfBirth) {
      return (
        <TextInputWithLabelFormGroup
          label={t('patient.approximateAge')}
          name="approximateAge"
          type="number"
          value={`${differenceInYears(new Date(Date.now()), new Date(patient.dateOfBirth))}`}
          isEditable={isEditable}
          onChange={onApproximateAgeChange}
        />
      )
    }

    return (
      <DatePickerWithLabelFormGroup
        name="dateOfBirth"
        label={t('patient.dateOfBirth')}
        isEditable={isEditable && !patient.isApproximateDateOfBirth}
        value={
          patient.dateOfBirth && patient.dateOfBirth.length > 0
            ? new Date(patient.dateOfBirth)
            : undefined
        }
        maxDate={new Date(Date.now().valueOf())}
        onChange={(date: Date) => onFieldChange('dateOfBirth', date.toISOString())}
        isInvalid={!!error?.dateOfBirth}
        feedback={t(error?.dateOfBirth)}
      />
    )
  }

  const renderContactInfoPanel = (contactInfoPanel: ContactInfoPanelConfig) => {
    const panel = (
      <Panel title={t(contactInfoPanel.label)} color="primary" collapsible>
        <ContactInfo
          component={contactInfoPanel.component}
          data={patient[contactInfoPanel.name]}
          errors={contactInfoPanel.errors}
          label={contactInfoPanel.label}
          name={contactInfoPanel.inputName}
          isEditable={isEditable}
          onChange={onContactInfoChange(contactInfoPanel.name)}
        />
      </Panel>
    )

    return contactInfoPanel.className ? (
      <div className={contactInfoPanel.className} key={contactInfoPanel.name}>
        {panel}
      </div>
    ) : (
      <div key={contactInfoPanel.name}>{panel}</div>
    )
  }

  return (
    <div>
      <Panel title={t('patient.basicInformation')} color="primary" collapsible>
        {error?.message && <Alert className="alert" color="danger" message={t(error?.message)} />}
        <div className="row">{nameFields.map(renderTextField)}</div>
        <div className="row">{selectFields.map(renderSelectField)}</div>
        <div className="row">
          <div className="col-md-3">
            {renderDateOfBirthField()}
            <div className="form-group">
              <Checkbox
                label={t('patient.unknownDateOfBirth')}
                name="unknown"
                disabled={!isEditable}
                onChange={onUnknownDateOfBirthChange}
              />
            </div>
          </div>
          {detailFields.map(renderTextField)}
        </div>
      </Panel>
      <br />
      <Panel title={t('patient.contactInformation')} color="primary" collapsible>
        {contactInfoPanels.map(renderContactInfoPanel)}
      </Panel>
    </div>
  )
}

export default GeneralInformation

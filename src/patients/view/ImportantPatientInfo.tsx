import { Row, Table, Button, Typography } from '@hospitalrun/components'
import React, { CSSProperties, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import useTranslator from '../../shared/hooks/useTranslator'
import Allergy from '../../shared/model/Allergy'
import CarePlan from '../../shared/model/CarePlan'
import Diagnosis from '../../shared/model/Diagnosis'
import Patient from '../../shared/model/Patient'
import Permissions from '../../shared/model/Permissions'
import { RootState } from '../../shared/store'
import { formatDate } from '../../shared/util/formatDate'
import NewAllergyModal from '../allergies/NewAllergyModal'
import AddCarePlanModal from '../care-plans/AddCarePlanModal'
import AddDiagnosisModal from '../diagnoses/AddDiagnosisModal'
import usePatientAllergies from '../hooks/usePatientAllergies'
import AddVisitModal from '../visits/AddVisitModal'

interface Props {
  patient: Patient
}

interface PatientHeaderProps {
  patient: Patient
  t: (key: string) => string
  canAddVisit: boolean
  onAddVisitClick: () => void
}

interface AllergiesSectionProps {
  allergies: Allergy[]
  canAddAllergy: boolean
  onAddAllergyClick: () => void
  onAllergiesTableClick: () => void
  t: (key: string) => string
}

interface DiagnosesSectionProps {
  diagnoses: Diagnosis[]
  canAddDiagnosis: boolean
  onAddDiagnosisClick: () => void
  onDiagnosisClick: (diagnosis: Diagnosis) => void
  t: (key: string) => string
}

interface CarePlanSectionProps {
  carePlans: CarePlan[]
  canAddCarePlan: boolean
  onAddCarePlanClick: () => void
  onCarePlanClick: (carePlan: CarePlan) => void
  t: (key: string) => string
}

interface PatientModalsProps {
  patient: Patient
  showNewAllergyModal: boolean
  showDiagnosisModal: boolean
  showAddCarePlanModal: boolean
  showAddVisitModal: boolean
  onCloseNewAllergyModal: () => void
  onCloseDiagnosisModal: () => void
  onCloseAddCarePlanModal: () => void
  onCloseAddVisitModal: () => void
}

const headerRowStyle: CSSProperties = {
  minHeight: '3rem',
  marginBottom: '1rem',
}

const middleRowStyle: CSSProperties = {
  minHeight: '3rem',
  marginBottom: '1rem',
}

const headerInfoStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  color: 'black',
  backgroundColor: 'rgba(245,245,245,1)',
  fontSize: 'small',
  textAlign: 'center',
  justifyContent: 'center',
  height: '100%',
}

const headerInfoPatientNameStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  color: 'black',
  textAlign: 'left',
  justifyContent: 'center',
  height: '100%',
}

const headerAddVisitButtonStyle: CSSProperties = {
  height: '2.5rem',
}

const middleRowSectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}

const tableContainerStyle: CSSProperties = {
  fontSize: 'small',
}

const getPatientCode = (p: Patient): string => {
  if (p) {
    return p.code
  }

  return ''
}

const PatientHeader = (props: PatientHeaderProps) => {
  const { patient, t, canAddVisit, onAddVisitClick } = props

  return (
    <Row style={headerRowStyle}>
      <div className="col-2">
        <div style={headerInfoPatientNameStyle}>
          <h3>{patient.fullName}</h3>
        </div>
      </div>
      <div className="col-2">
        <div style={headerInfoStyle}>
          <strong>{t('patient.code')}</strong>
          <h6>{getPatientCode(patient)}</h6>
        </div>
      </div>
      <div className="col-2">
        <div style={headerInfoStyle} className="patient-sex">
          <strong>{t('patient.sex')}</strong>
          <h6>{patient.sex}</h6>
        </div>
      </div>
      <div className="col-2">
        <div style={headerInfoStyle} className="patient-dateOfBirth">
          <strong>{t('patient.dateOfBirth')}</strong>
          <h6>
            {patient.dateOfBirth
              ? formatDate(patient.dateOfBirth)
              : t('patient.unknownDateOfBirth')}
          </h6>
        </div>
      </div>

      <div className="col d-flex justify-content-end align-items-center">
        {canAddVisit && (
          <Button
            outlined
            color="success"
            icon="add"
            iconLocation="left"
            style={headerAddVisitButtonStyle}
            onClick={onAddVisitClick}
          >
            {t('patient.visits.new')}
          </Button>
        )}
      </div>
    </Row>
  )
}

const AllergiesSection = (props: AllergiesSectionProps) => {
  const { allergies, canAddAllergy, onAddAllergyClick, onAllergiesTableClick, t } = props

  return (
    <div className="col allergies-section" style={middleRowSectionStyle}>
      <Typography variant="h5">{t('patient.allergies.label')}</Typography>
      <div className="border border-primary" style={tableContainerStyle}>
        <Table
          tableClassName="table table-hover table-sm m-0"
          onRowClick={onAllergiesTableClick}
          getID={(row) => row.id}
          columns={[{ label: t('patient.allergies.allergyName'), key: 'name' }]}
          data={allergies}
        />
      </div>
      {canAddAllergy && (
        <Button
          size="small"
          color="primary"
          icon="add"
          iconLocation="left"
          onClick={onAddAllergyClick}
        >
          {t('patient.allergies.new')}
        </Button>
      )}
    </div>
  )
}

const DiagnosesSection = (props: DiagnosesSectionProps) => {
  const { diagnoses, canAddDiagnosis, onAddDiagnosisClick, onDiagnosisClick, t } = props

  return (
    <div className="col diagnoses-section" style={middleRowSectionStyle}>
      <Typography variant="h5">{t('patient.diagnoses.label')}</Typography>
      <div className="border border-primary" style={tableContainerStyle}>
        <Table
          tableClassName="table table-hover table-sm m-0"
          onRowClick={onDiagnosisClick}
          getID={(row) => row.id}
          columns={[
            { label: t('patient.diagnoses.diagnosisName'), key: 'name' },
            {
              label: t('patient.diagnoses.diagnosisDate'),
              key: 'diagnosisDate',
              formatter: (row) => formatDate(row.diagnosisDate),
            },
            { label: t('patient.diagnoses.status'), key: 'status' },
          ]}
          data={diagnoses}
        />
      </div>
      {canAddDiagnosis && (
        <Button
          size="small"
          color="primary"
          icon="add"
          iconLocation="left"
          onClick={onAddDiagnosisClick}
        >
          {t('patient.diagnoses.new')}
        </Button>
      )}
    </div>
  )
}

const CarePlanSection = (props: CarePlanSectionProps) => {
  const { carePlans, canAddCarePlan, onAddCarePlanClick, onCarePlanClick, t } = props

  return (
    <div className="col carePlan-section" style={middleRowSectionStyle}>
      <Typography variant="h5">{t('patient.carePlan.label')}</Typography>
      <div className="border border-primary" style={tableContainerStyle}>
        <Table
          tableClassName="table table-hover table-sm m-0"
          onRowClick={onCarePlanClick}
          getID={(row) => row.id}
          data={carePlans}
          columns={[
            { label: t('patient.carePlan.title'), key: 'title' },
            {
              label: t('patient.carePlan.startDate'),
              key: 'startDate',
              formatter: (row) => formatDate(row.startDate),
            },
            {
              label: t('patient.carePlan.endDate'),
              key: 'endDate',
              formatter: (row) => formatDate(row.endDate),
            },
            { label: t('patient.carePlan.status'), key: 'status' },
          ]}
        />
      </div>
      {canAddCarePlan && (
        <Button
          size="small"
          color="primary"
          icon="add"
          iconLocation="left"
          onClick={onAddCarePlanClick}
        >
          {t('patient.carePlan.new')}
        </Button>
      )}
    </div>
  )
}

const PatientModals = (props: PatientModalsProps) => {
  const {
    patient,
    showNewAllergyModal,
    showDiagnosisModal,
    showAddCarePlanModal,
    showAddVisitModal,
    onCloseNewAllergyModal,
    onCloseDiagnosisModal,
    onCloseAddCarePlanModal,
    onCloseAddVisitModal,
  } = props

  return (
    <>
      <NewAllergyModal
        show={showNewAllergyModal}
        onCloseButtonClick={onCloseNewAllergyModal}
        patientId={patient.id}
      />

      <AddDiagnosisModal
        show={showDiagnosisModal}
        onCloseButtonClick={onCloseDiagnosisModal}
        patient={patient}
      />

      <AddCarePlanModal
        show={showAddCarePlanModal}
        onCloseButtonClick={onCloseAddCarePlanModal}
        patient={patient}
      />

      <AddVisitModal
        show={showAddVisitModal}
        onCloseButtonClick={onCloseAddVisitModal}
        patientId={patient.id}
      />
    </>
  )
}

const ImportantPatientInfo = (props: Props) => {
  const { patient } = props
  const { t } = useTranslator()
  const history = useHistory()
  const { permissions } = useSelector((state: RootState) => state.user)
  const [showNewAllergyModal, setShowNewAllergyModal] = useState(false)
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false)
  const [showAddCarePlanModal, setShowAddCarePlanModal] = useState(false)
  const [showAddVisitModal, setShowAddVisitModal] = useState(false)
  const { data, status } = usePatientAllergies(patient.id)

  const allergies = data && status !== 'loading' ? (data as Allergy[]) : []
  const diagnoses = patient.diagnoses ? (patient.diagnoses as Diagnosis[]) : []
  const carePlans = patient.carePlans || []

  return (
    <div>
      <PatientHeader
        patient={patient}
        t={t}
        canAddVisit={permissions.includes(Permissions.AddVisit)}
        onAddVisitClick={() => setShowAddVisitModal(true)}
      />

      <Row style={middleRowStyle}>
        <AllergiesSection
          allergies={allergies}
          canAddAllergy={permissions.includes(Permissions.AddAllergy)}
          onAddAllergyClick={() => setShowNewAllergyModal(true)}
          onAllergiesTableClick={() => history.push(`/patients/${patient.id}/allergies`)}
          t={t}
        />

        <DiagnosesSection
          diagnoses={diagnoses}
          canAddDiagnosis={permissions.includes(Permissions.AddDiagnosis)}
          onAddDiagnosisClick={() => setShowDiagnosisModal(true)}
          onDiagnosisClick={(diagnosis) =>
            history.push(`/patients/${patient.id}/diagnoses/${diagnosis.id}`)
          }
          t={t}
        />

        <CarePlanSection
          carePlans={carePlans}
          canAddCarePlan={permissions.includes(Permissions.AddCarePlan)}
          onAddCarePlanClick={() => setShowAddCarePlanModal(true)}
          onCarePlanClick={(carePlan) =>
            history.push(`/patients/${patient.id}/care-plans/${carePlan.id}`)
          }
          t={t}
        />
      </Row>

      <PatientModals
        patient={patient}
        showNewAllergyModal={showNewAllergyModal}
        showDiagnosisModal={showDiagnosisModal}
        showAddCarePlanModal={showAddCarePlanModal}
        showAddVisitModal={showAddVisitModal}
        onCloseNewAllergyModal={() => setShowNewAllergyModal(false)}
        onCloseDiagnosisModal={() => setShowDiagnosisModal(false)}
        onCloseAddCarePlanModal={() => setShowAddCarePlanModal(false)}
        onCloseAddVisitModal={() => setShowAddVisitModal(false)}
      />
    </div>
  )
}

export default ImportantPatientInfo

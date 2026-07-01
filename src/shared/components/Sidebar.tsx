import { List, ListItem, Icon } from '@hospitalrun/components'
import type { IconType } from '@hospitalrun/components/dist/components/Icon/interfaces'
import React, { useState, CSSProperties } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'

import useTranslator from '../hooks/useTranslator'
import Permissions from '../model/Permissions'
import { RootState } from '../store'
import { updateSidebar } from './component-slice'

type ExpansionItem =
  | 'none'
  | 'patient'
  | 'appointment'
  | 'labs'
  | 'medications'
  | 'incidents'
  | 'imagings'

type SidebarSubItem = {
  icon: IconType
  label: string
  path: string
  permission: Permissions
  active: (pathSegment: string, pathLength: number) => boolean
}

type SidebarSection = {
  icon: IconType
  label: string
  path: string
  pathSegment: string
  expansionItem: ExpansionItem
  initialPathSegment: string
  subListClassName?: string
  subItems: SidebarSubItem[]
}

type SidebarNavigationSectionProps = {
  expandedItem: ExpansionItem
  pathSegment: string
  pathLength: number
  permissions: (Permissions | null)[]
  section: SidebarSection
  sidebarCollapsed: boolean
  setExpansion: (item: ExpansionItem) => void
  t: (translationKey: string) => string
  navigateTo: (location: string) => void
}

const listItemStyle: CSSProperties = {
  cursor: 'pointer',
}

const expandableArrowStyle: CSSProperties = {
  marginRight: '20px',
}

const iconMargin: CSSProperties = {
  marginRight: '10px',
}

const listSubItemStyle: CSSProperties = {
  cursor: 'pointer',
  fontSize: 'small',
  borderBottomWidth: 0,
  borderTopWidth: 0,
  color: 'black',
  padding: '.6rem 1.25rem',
  backgroundColor: 'rgba(245,245,245,1)',
}

const getNewPathActive = (activePathSegment: string) => (pathSegment: string, pathLength: number) =>
  pathSegment.includes(activePathSegment) && pathLength > 2

const getListPathActive = (activePathSegment: string) => (
  pathSegment: string,
  pathLength: number,
) => pathSegment.includes(activePathSegment) && pathLength < 3

const sidebarSections: SidebarSection[] = [
  {
    icon: 'patients',
    label: 'patients.label',
    path: '/patients',
    pathSegment: 'patient',
    expansionItem: 'patient',
    initialPathSegment: 'patients',
    subItems: [
      {
        icon: 'patient-add',
        label: 'patients.newPatient',
        path: '/patients/new',
        permission: Permissions.WritePatients,
        active: getNewPathActive('patients'),
      },
      {
        icon: 'incident',
        label: 'patients.patientsList',
        path: '/patients',
        permission: Permissions.ReadPatients,
        active: getListPathActive('patients'),
      },
    ],
  },
  {
    icon: 'appointment',
    label: 'scheduling.label',
    path: '/appointments',
    pathSegment: 'appointments',
    expansionItem: 'appointment',
    initialPathSegment: 'appointments',
    subListClassName: 'nav flex-column',
    subItems: [
      {
        icon: 'appointment-add',
        label: 'scheduling.appointments.new',
        path: '/appointments/new',
        permission: Permissions.WriteAppointments,
        active: getNewPathActive('appointments'),
      },
      {
        icon: 'incident',
        label: 'scheduling.appointments.schedule',
        path: '/appointments',
        permission: Permissions.ReadAppointments,
        active: getListPathActive('appointments'),
      },
    ],
  },
  {
    icon: 'medication',
    label: 'medications.label',
    path: '/medications',
    pathSegment: 'medications',
    expansionItem: 'medications',
    initialPathSegment: 'medications',
    subListClassName: 'nav flex-column',
    subItems: [
      {
        icon: 'add',
        label: 'medications.requests.new',
        path: '/medications/new',
        permission: Permissions.RequestMedication,
        active: getNewPathActive('medications'),
      },
      {
        icon: 'incident',
        label: 'medications.requests.label',
        path: '/medications',
        permission: Permissions.ViewMedications,
        active: getListPathActive('medications'),
      },
    ],
  },
  {
    icon: 'lab',
    label: 'labs.label',
    path: '/labs',
    pathSegment: 'labs',
    expansionItem: 'labs',
    initialPathSegment: 'labs',
    subListClassName: 'nav flex-column',
    subItems: [
      {
        icon: 'add',
        label: 'labs.requests.new',
        path: '/labs/new',
        permission: Permissions.RequestLab,
        active: getNewPathActive('labs'),
      },
      {
        icon: 'incident',
        label: 'labs.requests.label',
        path: '/labs',
        permission: Permissions.ViewLabs,
        active: getListPathActive('labs'),
      },
    ],
  },
  {
    icon: 'image',
    label: 'imagings.label',
    path: '/imaging',
    pathSegment: 'imaging',
    expansionItem: 'imagings',
    initialPathSegment: 'imagings',
    subListClassName: 'nav flex-column',
    subItems: [
      {
        icon: 'add',
        label: 'imagings.requests.new',
        path: '/imaging/new',
        permission: Permissions.RequestImaging,
        active: getNewPathActive('imaging'),
      },
      {
        icon: 'image',
        label: 'imagings.requests.label',
        path: '/imaging',
        permission: Permissions.ViewImagings,
        active: getListPathActive('imaging'),
      },
    ],
  },
  {
    icon: 'incident',
    label: 'incidents.label',
    path: '/incidents',
    pathSegment: 'incidents',
    expansionItem: 'incidents',
    initialPathSegment: 'incidents',
    subListClassName: 'nav flex-column',
    subItems: [
      {
        icon: 'add',
        label: 'incidents.reports.new',
        path: '/incidents/new',
        permission: Permissions.ReportIncident,
        active: getNewPathActive('incidents'),
      },
      {
        icon: 'incident',
        label: 'incidents.reports.label',
        path: '/incidents',
        permission: Permissions.ViewIncidents,
        active: getListPathActive('incidents'),
      },
      {
        icon: 'incident',
        label: 'incidents.visualize.label',
        path: '/incidents/visualize',
        permission: Permissions.ViewIncidentWidgets,
        active: getListPathActive('incidents'),
      },
    ],
  },
]

const getInitialExpandedItem = (pathSegment: string): ExpansionItem =>
  sidebarSections.find((section) => pathSegment.includes(section.initialPathSegment))
    ?.expansionItem || 'none'

const SidebarNavigationSection = ({
  expandedItem,
  pathSegment,
  pathLength,
  permissions,
  section,
  sidebarCollapsed,
  setExpansion,
  t,
  navigateTo,
}: SidebarNavigationSectionProps) => {
  const isActiveSection = pathSegment.includes(section.pathSegment)
  const isExpanded = expandedItem === section.expansionItem

  return (
    <>
      <ListItem
        active={isActiveSection}
        onClick={() => {
          navigateTo(section.path)
          setExpansion(section.expansionItem)
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={isActiveSection && isExpanded ? 'down-arrow' : 'right-arrow'}
          style={expandableArrowStyle}
        />
        <Icon icon={section.icon} /> {!sidebarCollapsed && t(section.label)}
      </ListItem>
      {isActiveSection && isExpanded && (
        <List layout="flush" className={section.subListClassName}>
          {section.subItems.map(
            (item) =>
              permissions.includes(item.permission) && (
                <ListItem
                  key={item.label}
                  className="nav-item"
                  style={listSubItemStyle}
                  onClick={() => navigateTo(item.path)}
                  active={item.active(pathSegment, pathLength)}
                >
                  <Icon icon={item.icon} style={iconMargin} />
                  {!sidebarCollapsed && t(item.label)}
                </ListItem>
              ),
          )}
        </List>
      )}
    </>
  )
}

const Sidebar = () => {
  const dispatch = useDispatch()
  const { sidebarCollapsed } = useSelector((state: RootState) => state.components)
  const permissions = useSelector((state: RootState) => state.user.permissions)

  const { t } = useTranslator()
  const path = useLocation()
  const history = useHistory()
  const { pathname } = path
  const splittedPath = pathname.split('/')

  const navigateTo = (location: string) => {
    history.push(location)
  }

  const [expandedItem, setExpandedItem] = useState<ExpansionItem>(
    getInitialExpandedItem(splittedPath[1]),
  )

  const setExpansion = (item: ExpansionItem) => {
    if (expandedItem === item) {
      setExpandedItem('none')
      return
    }

    setExpandedItem(item)
  }

  const getDashboardLink = () => (
    <>
      <ListItem
        active={pathname === '/'}
        onClick={() => {
          navigateTo('/')
          setExpansion('none')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon icon="dashboard" /> {!sidebarCollapsed && t('dashboard.label')}
      </ListItem>
    </>
  )

  return (
    <nav
      className="d-none d-md-block bg-light sidebar"
      style={{ width: sidebarCollapsed ? '56px' : '' }}
    >
      <div className="sidebar-sticky">
        <List layout="flush" className="nav flex-column">
          <ListItem
            onClick={() => dispatch(updateSidebar())}
            className="nav-item"
            style={listItemStyle}
          >
            <Icon
              style={{ float: sidebarCollapsed ? 'left' : 'right' }}
              icon={sidebarCollapsed ? 'right-arrow' : 'left-arrow'}
            />
          </ListItem>
          {getDashboardLink()}
          {sidebarSections.map((section) => (
            <SidebarNavigationSection
              key={section.label}
              expandedItem={expandedItem}
              pathSegment={splittedPath[1]}
              pathLength={splittedPath.length}
              permissions={permissions}
              section={section}
              sidebarCollapsed={sidebarCollapsed}
              setExpansion={setExpansion}
              t={t}
              navigateTo={navigateTo}
            />
          ))}
        </List>
      </div>
    </nav>
  )
}

export default Sidebar

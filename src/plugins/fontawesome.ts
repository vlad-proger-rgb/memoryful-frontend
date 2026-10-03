import { ref } from 'vue'
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { IconLookup, IconName, IconPack, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons/faAlignLeft'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons/faAngleDown'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons/faAngleLeft'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight'
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons/faAnglesRight'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons/faArrowRightLong'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen'
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar'
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons/faCalendarDay'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons/faCalendarDays'
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera'
import { faChartSimple } from '@fortawesome/free-solid-svg-icons/faChartSimple'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch'
import { faCity } from '@fortawesome/free-solid-svg-icons/faCity'
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons/faCloudArrowUp'
import { faComments } from '@fortawesome/free-solid-svg-icons/faComments'
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy'
import { faDesktop } from '@fortawesome/free-solid-svg-icons/faDesktop'
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons/faDiagramProject'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons/faEllipsisVertical'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faExpand } from '@fortawesome/free-solid-svg-icons/faExpand'
import { faFlag } from '@fortawesome/free-solid-svg-icons/faFlag'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons/faFloppyDisk'
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear'
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe'
import { faHourglassHalf } from '@fortawesome/free-solid-svg-icons/faHourglassHalf'
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse'
import { faIcons } from '@fortawesome/free-solid-svg-icons/faIcons'
import { faIdCard } from '@fortawesome/free-solid-svg-icons/faIdCard'
import { faImage } from '@fortawesome/free-solid-svg-icons/faImage'
import { faImages } from '@fortawesome/free-solid-svg-icons/faImages'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons/faLightbulb'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot'
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'
import { faMobileScreenButton } from '@fortawesome/free-solid-svg-icons/faMobileScreenButton'
import { faPaintbrush } from '@fortawesome/free-solid-svg-icons/faPaintbrush'
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons/faPenToSquare'
import { faPersonWalking } from '@fortawesome/free-solid-svg-icons/faPersonWalking'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { faRobot } from '@fortawesome/free-solid-svg-icons/faRobot'
import { faRotate } from '@fortawesome/free-solid-svg-icons/faRotate'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft'
import { faShoePrints } from '@fortawesome/free-solid-svg-icons/faShoePrints'
import { faSliders } from '@fortawesome/free-solid-svg-icons/faSliders'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faStar } from '@fortawesome/free-solid-svg-icons/faStar'
import { faTags } from '@fortawesome/free-solid-svg-icons/faTags'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons/faUpRightFromSquare'
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { faWandMagic } from '@fortawesome/free-solid-svg-icons/faWandMagic'
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons/faWandMagicSparkles'
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
import { faAddressBook as farAddressBook } from '@fortawesome/free-regular-svg-icons/faAddressBook'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons/faStar'
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub'
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn'
import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien'
import { faTelegram } from '@fortawesome/free-brands-svg-icons/faTelegram'
import type { FAIcon } from '@/types/fontawesome'

// Only icons the UI names itself; stored and AI-chosen ones load their pack via `loadIconPack`.
library.add(
  faAlignLeft,
  faAngleDown,
  faAngleLeft,
  faAngleRight,
  faAnglesRight,
  faArrowDown,
  faArrowRight,
  faArrowRightLong,
  faArrowUp,
  faArrowUpRightFromSquare,
  faBars,
  faBook,
  faBookOpen,
  faCalendar,
  faCalendarDay,
  faCalendarDays,
  faCamera,
  faChartSimple,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircleInfo,
  faCircleNotch,
  faCity,
  faCloudArrowUp,
  faComments,
  faCopy,
  faDesktop,
  faDiagramProject,
  faEllipsisVertical,
  faEnvelope,
  faExpand,
  faFlag,
  faFloppyDisk,
  faGear,
  faGlobe,
  faHourglassHalf,
  faHouse,
  faIcons,
  faIdCard,
  faImage,
  faImages,
  faLightbulb,
  faLocationDot,
  faLock,
  faMagnifyingGlass,
  faMobileScreenButton,
  faPaintbrush,
  faPen,
  faPenToSquare,
  faPersonWalking,
  faPlus,
  faQuestion,
  faRobot,
  faRotate,
  faRotateLeft,
  faShoePrints,
  faSliders,
  faSpinner,
  faStar,
  faTags,
  faTrash,
  faUpRightFromSquare,
  faUpload,
  faUser,
  faWandMagic,
  faWandMagicSparkles,
  faXmark,
  farAddressBook,
  farStar,
  faGithub,
  faLinkedinIn,
  faRedditAlien,
  faTelegram,
)

type LoadablePrefix = 'fas' | 'far' | 'fab'

const packLoaders: Record<LoadablePrefix, () => Promise<IconPack>> = {
  fas: () => import('@fortawesome/free-solid-svg-icons').then((m) => m.fas),
  far: () => import('@fortawesome/free-regular-svg-icons').then((m) => m.far),
  fab: () => import('@fortawesome/free-brands-svg-icons').then((m) => m.fab),
}

const pendingPacks = new Map<LoadablePrefix, Promise<IconPack>>()

/** Bumped each time a pack joins the library, so lookups that missed can run again. */
const iconLibraryVersion = ref(0)

const isLoadablePrefix = (prefix: string): prefix is LoadablePrefix => prefix in packLoaders

const loadIconPack = (prefix: LoadablePrefix): Promise<IconPack> => {
  let pending = pendingPacks.get(prefix)
  if (!pending) {
    pending = packLoaders[prefix]().then(
      (pack) => {
        library.add(pack)
        iconLibraryVersion.value++
        return pack
      },
      (error: unknown) => {
        pendingPacks.delete(prefix)
        throw error
      },
    )
    pendingPacks.set(prefix, pending)
  }
  return pending
}

const findIcon = (lookup: IconLookup) => {
  void iconLibraryVersion.value
  return findIconDefinition(lookup)
}

const toLookup = (iconName: string, prefix = 'fas'): IconLookup => ({
  prefix: prefix as IconPrefix,
  iconName: iconName as IconName,
})

const getIcon = (icon: FAIcon) => {
  return [icon.style || 'fas', icon.name]
}

export { FontAwesomeIcon, findIcon, getIcon, isLoadablePrefix, loadIconPack, toLookup }

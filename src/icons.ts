import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGithub,
  faLinkedin,
  faInstagram,
  faSoundcloud,
} from '@fortawesome/free-brands-svg-icons'
import {
  faChevronLeft,
  faCaretDown,
  faPause,
  faPen,
  faPlay,
  faPlus,
  faDice,
  faEye as faEyeSolid,
  faMusic,
  faTrash,
  faVolumeMute,
  faVolumeUp,
} from '@fortawesome/free-solid-svg-icons'
import {
  faCopy,
  faEnvelope,
  faFileLines,
  faFloppyDisk,
  faEye,
} from '@fortawesome/free-regular-svg-icons'
import { App, Plugin } from 'vue'

const icons = [
  faCaretDown,
  faChevronLeft,
  faCopy,
  faDice,
  faEnvelope,
  faEye,
  faEyeSolid,
  faFileLines,
  faFloppyDisk,
  faGithub,
  faInstagram,
  faLinkedin,
  faMusic,
  faPause,
  faPen,
  faPlay,
  faPlus,
  faSoundcloud,
  faTrash,
  faVolumeMute,
  faVolumeUp,
]

const addIcons: Plugin = (app: App) => {
  library.add(...icons)
  app.component('FontAwesomeIcon', FontAwesomeIcon)
}

export default addIcons

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
  faPlay,
  faPlus,
  faDice,
  faEye as faEyeSolid,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import {
  faEnvelope,
  faFileLines,
  faFloppyDisk,
  faEye,
} from '@fortawesome/free-regular-svg-icons'
import { App, Plugin } from 'vue'

const icons = [
  faCaretDown,
  faChevronLeft,
  faDice,
  faEnvelope,
  faEye,
  faEyeSolid,
  faFileLines,
  faFloppyDisk,
  faGithub,
  faInstagram,
  faLinkedin,
  faPlay,
  faPlus,
  faSoundcloud,
  faTrash,
  faXmark,
]

const addIcons: Plugin = (app: App) => {
  library.add(...icons)
  app.component('FontAwesomeIcon', FontAwesomeIcon)
}

export default addIcons

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGithub,
  faLinkedin,
  faInstagram,
  faSoundcloud,
} from '@fortawesome/free-brands-svg-icons'
import {
  faMobileScreenButton,
  faChevronLeft,
  faPlay,
  faDice,
  faShapes,
  faEye as faEyeSolid,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import {
  faComments,
  faEnvelope,
  faFileLines,
  faEye,
} from '@fortawesome/free-regular-svg-icons'
import { App, Plugin } from 'vue'

const icons = [
  faChevronLeft,
  faComments,
  faDice,
  faEnvelope,
  faEye,
  faEyeSolid,
  faFileLines,
  faGithub,
  faInstagram,
  faLinkedin,
  faMobileScreenButton,
  faPlay,
  faShapes,
  faSoundcloud,
  faXmark,
]

const addIcons: Plugin = (app: App) => {
  library.add(...icons)
  app.component('FontAwesomeIcon', FontAwesomeIcon)
}

export default addIcons

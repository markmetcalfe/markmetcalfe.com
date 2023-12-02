import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGithub,
  faLinkedin,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons'
import {
  faMobileScreenButton,
  faChevronLeft,
  faPlay,
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons'
import {
  faComments,
  faEnvelope,
  faFileLines,
} from '@fortawesome/free-regular-svg-icons'
import { App, Plugin } from 'vue'

const icons = [
  faChevronLeft,
  faComments,
  faEnvelope,
  faFileLines,
  faGithub,
  faInstagram,
  faLaptopCode,
  faLinkedin,
  faMobileScreenButton,
  faPlay,
]

const addIcons: Plugin = (app: App) => {
  library.add(...icons)
  app.component('FontAwesomeIcon', FontAwesomeIcon)
}

export default addIcons

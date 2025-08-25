import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons' // All solid icons
import { far } from '@fortawesome/free-regular-svg-icons' // All regular icons
import { fab } from '@fortawesome/free-brands-svg-icons' // All brand icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas, far, fab)

export { FontAwesomeIcon }

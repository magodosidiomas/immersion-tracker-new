import './Flag.css'
import us from 'flag-icons/flags/4x3/us.svg'
import es from 'flag-icons/flags/4x3/es.svg'
import it from 'flag-icons/flags/4x3/it.svg'
import fr from 'flag-icons/flags/4x3/fr.svg'
import de from 'flag-icons/flags/4x3/de.svg'
import nl from 'flag-icons/flags/4x3/nl.svg'
import ru from 'flag-icons/flags/4x3/ru.svg'
import jp from 'flag-icons/flags/4x3/jp.svg'
import cn from 'flag-icons/flags/4x3/cn.svg'
import kr from 'flag-icons/flags/4x3/kr.svg'
import pt from 'flag-icons/flags/4x3/pt.svg'
import sa from 'flag-icons/flags/4x3/sa.svg'
import inFlag from 'flag-icons/flags/4x3/in.svg'
import tr from 'flag-icons/flags/4x3/tr.svg'
import se from 'flag-icons/flags/4x3/se.svg'
import pl from 'flag-icons/flags/4x3/pl.svg'
import gr from 'flag-icons/flags/4x3/gr.svg'
import il from 'flag-icons/flags/4x3/il.svg'
import vn from 'flag-icons/flags/4x3/vn.svg'
import id from 'flag-icons/flags/4x3/id.svg'
import th from 'flag-icons/flags/4x3/th.svg'
import no from 'flag-icons/flags/4x3/no.svg'
import dk from 'flag-icons/flags/4x3/dk.svg'
import fi from 'flag-icons/flags/4x3/fi.svg'
import ua from 'flag-icons/flags/4x3/ua.svg'

// Importing flag-icons' own stylesheet would pull in every flag it
// ships (~270 countries) as build assets just to use the ones
// AVAILABLE_LANGUAGES actually lists — it bloated the CSS bundle from
// ~22KB to 440KB in testing. Importing only those specific SVGs keeps
// the data model's "stable, code-level catalog" approach (see
// data/availableLanguages.js) and means the bundle only grows when a
// language is actually added to that list.
const FLAGS = { us, es, it, fr, de, nl, ru, jp, cn, kr, pt, sa, in: inFlag, tr, se, pl, gr, il, vn, id, th, no, dk, fi, ua }

// Renders a country flag from the self-hosted flag-icons SVG set
// (Language.flagCode in the data model, e.g. "us") instead of an emoji
// character. Regional-indicator flag emoji depend on the OS/browser's
// emoji font — several platforms don't draw them as an actual flag,
// showing two letters in boxes instead. An SVG has no such dependency.
//
// Used as the `flag` slot's value wherever TopNav/Dropdown/
// SelectableListItem already accept one — those components stay
// decoration-agnostic, this is just what gets passed in now.
function Flag({ code, ...props }) {
  const src = FLAGS[code]
  if (!src) return null
  // Most flag SVGs are small enough to get inlined by Vite as a
  // data: URI (assetsInlineLimit), and that URI's own SVG markup uses
  // unescaped single quotes for attributes (xmlns='...', fill='...').
  // An unquoted url(...) value can't contain raw quote characters per
  // the CSS spec, so the browser silently drops the whole property.
  // Wrapping the value in double quotes — which never appear in these
  // SVGs — keeps it valid CSS for both inlined data URIs and the few
  // flags large enough to stay separate files (where quoting is a
  // no-op either way).
  return <span className="flag" style={{ backgroundImage: `url("${src}")` }} {...props} />
}

export default Flag

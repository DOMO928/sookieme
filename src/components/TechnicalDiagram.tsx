import CompactDiagram from './CompactDiagram';
import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
interface Props {
  locale: Locale;
  type: 'stroke' | 'graph' | 'assets' | 'animation' | 'instances' | 'codec';
  caption: string;
}
export default function TechnicalDiagram(props: Props) {
  const { locale } = props;
  const t = getTranslations(locale);
  const { type, caption } = props;
  return (
    <figure
      className={`engineering-figure diagram-${type}${['stroke', 'graph', 'instances', 'codec'].includes(type) ? ' diagram-responsive' : ''}`}
    >
      <div
        className="diagram-scroll"
        tabIndex={0}
        role="region"
        aria-label={t('technicalDiagram.scrollLabel')}
      >
        <svg
          viewBox="0 0 720 320"
          role="img"
          aria-label={caption}
          xmlns="http://www.w3.org/2000/svg"
        >
          {type === 'stroke' && (
            <>
              <g className="diagram-lines">
                <path d="M84 157C135 68 180 238 232 142" strokeWidth="25" opacity=".12" />
                <path d="M84 157C135 68 180 238 232 142" strokeWidth="1.5" />
                <path d="M257 155H330M474 155H520V65H558M520 155H558M520 155V245H558" />
              </g>
              <g className="diagram-nodes">
                <rect x="330" y="120" width="144" height="70" rx="3" />
                <circle cx="520" cy="155" r="3" />
              </g>
              <g className="diagram-labels">
                <text x="64" y="253">
                  STROKE INPUT
                </text>
                <text x="353" y="151">
                  Shared plan
                </text>
                <text x="354" y="174" className="diagram-small">
                  one interpretation
                </text>
                <text x="576" y="61">
                  Bounds
                </text>
                <text x="576" y="83" className="diagram-small">
                  layout extents
                </text>
                <text x="576" y="151">
                  Paint
                </text>
                <text x="576" y="173" className="diagram-small">
                  appearance
                </text>
                <text x="576" y="241">
                  Geometry
                </text>
                <text x="576" y="263" className="diagram-small">
                  shape data
                </text>
                <text x="64" y="278" className="diagram-small">
                  width · align · paint
                </text>
              </g>
            </>
          )}
          {type === 'graph' && (
            <>
              <g className="diagram-lines">
                <path d="M93 147H189M291 107H385M291 195H385M240 140V163M440 139V163M488 195H605V147M488 107H605V147" />
                <path d="M120 286H600" strokeDasharray="3 6" />
              </g>
              <g className="diagram-nodes">
                <circle cx="78" cy="147" r="16" />
                <rect x="189" y="76" width="102" height="63" rx="3" />
                <rect x="189" y="164" width="102" height="63" rx="3" />
                <rect x="385" y="76" width="103" height="63" rx="3" />
                <rect x="385" y="164" width="103" height="63" rx="3" />
                <circle cx="605" cy="147" r="16" />
              </g>
              <g className="diagram-labels">
                <text x="45" y="195" className="diagram-small">
                  scene
                </text>
                <text x="210" y="113">
                  pass A
                </text>
                <text x="210" y="201">
                  pass B
                </text>
                <text x="406" y="113">
                  pass C
                </text>
                <text x="406" y="201">
                  pass D
                </text>
                <text x="575" y="205" className="diagram-small">
                  submit
                </text>
                <text x="181" y="44" className="diagram-small">
                  DEPENDENCIES
                </text>
                <text x="200" y="279" className="diagram-small">
                  temporary texture lifetime
                </text>
              </g>
              <path d="M200 286H492" className="diagram-accent-line" />
              <circle cx="200" cy="286" r="4" fill="#d7d0bb" />
              <circle cx="492" cy="286" r="4" fill="#d7d0bb" />
            </>
          )}
          {type === 'assets' && (
            <>
              <g className="diagram-lines">
                <path
                  d="M65 75L164 62L208 123L142 184L61 160Z M65 75L142 184L164 62L61 160L208 123L65 75M105 73L88 139L173 163L130 66M64 107L191 98L112 174M62 139L176 80M106 177L185 147"
                  opacity=".8"
                />
                <path d="M297 75L396 62L440 123L374 184L293 160Z M297 75L374 184L396 62L293 160L440 123L297 75" />
                <path d="M234 126H270M462 126H510" />
              </g>
              <g className="diagram-nodes">
                <rect x="526" y="69" width="139" height="115" rx="3" />
                <path d="M553 133L581 153L634 102" className="diagram-accent-line" />
              </g>
              <g className="diagram-labels">
                <text x="66" y="235">
                  Source asset
                </text>
                <text x="294" y="235">
                  Optimize
                </text>
                <text x="535" y="235">
                  Preview
                </text>
                <text x="66" y="261" className="diagram-small">
                  geometry + texture
                </text>
                <text x="294" y="261" className="diagram-small">
                  prune · weld · simplify
                </text>
                <text x="535" y="261" className="diagram-small">
                  designer review
                </text>
              </g>
              <path d="M592 287H367" className="diagram-lines" strokeDasharray="3 5" />
              <path d="M377 281L367 287L377 293" className="diagram-lines" />
            </>
          )}
          {type === 'animation' && (
            <>
              <g className="diagram-lines">
                <path d="M84 161H646M588 182V250H238V182" />
                <path d="M84 145V177M252 145V177M420 145V177M588 145V177" />
              </g>
              <g className="diagram-nodes">
                <circle cx="84" cy="161" r="8" />
                <circle cx="252" cy="161" r="8" />
                <circle cx="420" cy="161" r="8" />
                <circle cx="588" cy="161" r="8" />
              </g>
              <g className="diagram-labels">
                <text x="67" y="124">
                  idle
                </text>
                <text x="244" y="124">
                  in
                </text>
                <text x="407" y="124" fill="#d7d0bb">
                  ing
                </text>
                <text x="575" y="124">
                  out
                </text>
                <text x="57" y="202" className="diagram-small">
                  {t('technicalDiagram.animation0')}
                </text>
                <text x="219" y="202" className="diagram-small">
                  {t('technicalDiagram.animation1')}
                </text>
                <text x="379" y="202" className="diagram-small">
                  {t('technicalDiagram.animation2')}
                </text>
                <text x="552" y="202" className="diagram-small">
                  {t('technicalDiagram.animation3')}
                </text>
                <text x="305" y="279" className="diagram-small">
                  {t('technicalDiagram.animation4')}
                </text>
              </g>
              <path d="M335 161H503" className="diagram-accent-line" strokeWidth="3" />
            </>
          )}
          {type === 'instances' && (
            <>
              <g className="diagram-lines">
                <rect x="74" y="91" width="79" height="117" rx="5" />
                <path d="M169 149H258M284 149H342M310 149V79H360M310 149V223H360" />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <rect
                    key={i}
                    x={373 + i * 36}
                    y={67 + i * 16}
                    width="80"
                    height="118"
                    rx="4"
                    fill="#101215"
                  />
                ))}
              </g>
              <g className="diagram-labels">
                <text x="66" y="247">
                  Geometry
                </text>
                <text x="66" y="271" className="diagram-small">
                  shared mesh / material
                </text>
                <text x="379" y="291" className="diagram-small">
                  per-instance transform + UV
                </text>
              </g>
              <g fill="#d7d0bb">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <circle key={i} cx={389 + i * 36} cy={83 + i * 16} r="3" />
                ))}
              </g>
            </>
          )}
          {type === 'codec' && (
            <>
              <g className="diagram-lines">
                <path d="M65 280V41M65 280H650" opacity=".5" />
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={i}
                    d={`M82 ${91 + i * 44} C155 ${35 + i * 44} 201 ${140 + i * 44} 270 ${88 + i * 44} S405 ${42 + i * 44} 471 ${88 + i * 44} S558 ${136 + i * 44} 643 ${75 + i * 44}`}
                    opacity={0.95 - i * 0.18}
                  />
                ))}
              </g>
              {[102, 267, 452, 613].map((x, i) => (
                <g key={x}>
                  <path
                    d={`M${x} 55V270`}
                    className="diagram-lines"
                    strokeDasharray="2 6"
                    opacity=".4"
                  />
                  <circle cx={x} cy={[81, 90, 73, 100][i]} r="5" fill="#d7d0bb" />
                </g>
              ))}
              <g className="diagram-labels">
                <text x="82" y="30" className="diagram-small">
                  DENSE MOTION → SPARSE TARGETS
                </text>
                <text x="550" y="311" className="diagram-small">
                  {t('technicalDiagram.time')}
                </text>
                <text x="470" y="30" className="diagram-small">
                  {t('technicalDiagram.conceptDiagram')}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>
      <CompactDiagram type={type} caption={caption} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

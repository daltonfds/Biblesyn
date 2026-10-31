'use client';

import {useLocale} from '@/components/I18nProvider';

const messages: Record<string, string> = {
  en: 'Strengthening your spirit…',
  pt: 'Fortalecendo o seu espírito…',
  fr: 'Fortifier votre esprit…',
  es: 'Fortaleciendo tu espíritu…',
};

export default function LogoLoader() {
  const locale = useLocale();
  return (
    <main className="biblesyn-loader" role="status" aria-live="polite" aria-label={messages[locale] || messages.en}>
      <svg className="biblesyn-loader__mark" viewBox="0 0 560 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g className="biblesyn-loader__paths" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
          <path pathLength="1" d="M36 165 C76 129 126 94 190 76 C205 72 221 72 238 78 C253 85 264 98 272 114 C258 139 237 159 211 174 C182 191 151 199 120 190 C87 181 59 170 36 165Z"/>
          <path pathLength="1" d="M178 78 C177 57 177 42 178 27 C201 52 230 66 270 72 C293 76 312 91 322 113 C331 130 331 145 327 158 C307 144 291 137 270 135 C230 131 199 112 178 78Z"/>
          <path pathLength="1" d="M240 73 C232 51 232 35 234 20 C254 43 282 56 315 68 C341 77 358 94 365 117 C367 129 364 140 358 149 C347 127 333 113 313 105 C285 95 260 87 240 73Z"/>
          <path pathLength="1" d="M326 119 C343 93 362 79 380 78 C399 77 415 92 422 111 C429 131 422 150 408 168 C394 187 370 199 348 211 C327 224 313 243 306 270 C280 261 260 245 250 223"/>
          <path pathLength="1" d="M408 166 L500 70 M412 165 L498 258 M469 164 L535 164 M502 128 L502 205"/>
          <path pathLength="1" d="M203 124 C221 137 241 143 263 143"/>
        </g>
      </svg>
      <p className="biblesyn-loader__message">{messages[locale] || messages.en}</p>
    </main>
  );
}

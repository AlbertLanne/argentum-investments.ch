import Script from 'next/script'

/**
 * Conteneur Google Tag Manager du groupe Argentum.
 *
 * L'identifiant n'est pas un secret : GTM l'expose dans le HTML de chaque page, il est donc
 * écrit ici plutôt que dans une variable d'environnement qu'il faudrait redéfinir sur chaque
 * plateforme d'hébergement. Le mettre à vide désactive le suivi.
 */
export const GTM_ID = 'GTM-N97NF5N'

/** Charge la bibliothèque GTM. À placer dans le `<body>`, après le contenu. */
export function GoogleTagManagerScript() {
  if (!GTM_ID) return null

  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  )
}

/**
 * Repli sans JavaScript. Google impose ce bloc en tout premier dans le `<body>` : placé plus
 * bas, le conteneur ne se déclenche pas pour les visiteurs qui bloquent les scripts.
 */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

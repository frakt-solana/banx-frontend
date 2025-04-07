import Script from 'next/script'

export default function Head() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <link rel="manifest" href="/manifest.json" />

      {/* Icons */}
      <link rel="icon" href="/icons/icon-192x192.png" />
      <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-5TLCSEKR77"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5TLCSEKR77');
        `}
      </Script>
    </>
  )
}

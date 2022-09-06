import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import adobeLoader from '../utils/adobeLoader'

function MyApp({ Component, pageProps }: AppProps) {
    useEffect(() => {
        adobeLoader(document)
    }, [])

    return <Component {...pageProps} />
}

export default MyApp

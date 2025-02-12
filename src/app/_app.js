import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <html lang="en">
      <body>
        <Component {...pageProps} />
      </body>
    </html>
  );
}

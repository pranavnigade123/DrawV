import MapVeto from '../../../components/mapveto/bo1';
import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Map Veto</title>
        <meta name="description" content="Valorant Tournament Map Veto Tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <MapVeto />
      </main>
    </div>
  );
}
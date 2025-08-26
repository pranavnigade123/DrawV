import MapVetoBo5 from '../../../components/mapveto/bo5';
import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Map Veto</title>
        <meta name="description" content="Valorant Tournament Map Veto Tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mt-20">
        <MapVetoBo5 />
      </main>
    </div>
  );
}
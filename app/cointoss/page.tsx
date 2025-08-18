import CoinToss from '../../components/CoinToss';
import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Coin Toss</title>
        <meta name="description" content="Draw V - Coin Toss" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <CoinToss />
      </main>
    </div>
  );
}